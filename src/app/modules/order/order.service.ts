import { ObjectId } from 'bson';
import { renderFile } from 'ejs';
import { Request } from 'express';
import httpStatus from 'http-status';
import mongoose, { ClientSession } from 'mongoose';
import puppeteer from 'puppeteer';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { renderEjs } from '../../utils/helper';
import Coupon from '../coupon/coupon.model';
import Product from '../product/product.model';
import Storefront from '../storefront/storefront.model';
import User from '../user/user.model';
import { IOrder } from './order.interface';
import Order from './order.model';
import { join } from 'path';
import { emailQueue, emailQueueName } from '../../jobs/EmailJob';

export const getAllOrder = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const { searchTerm } = query;
    const orderSearchableFields = ['name', 'email', 'phone'];

    const isObjectId = ObjectId.isValid(searchTerm as string);

    let searchConditions = orderSearchableFields.map((field) => ({
      [field]: { $regex: String(searchTerm), $options: 'i' }
    }));

    if (isObjectId) {
      searchConditions = [{ _id: new ObjectId(searchTerm as string) }, ...searchConditions] as any;
    }
    let searchQuery = {};
    if (searchTerm) {
      searchQuery = searchConditions.length > 0 ? { $or: searchConditions } : {};
    }

    const orderQuery = new QueryBuilder(Order.find(searchQuery), query)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await orderQuery.countTotal();
    const result = await orderQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {
  try {
    const order = await Order.findOne({ _id: id });
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'This order is not found');
    }
    return order;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createOrder = async (req: Request): Promise<IOrder | null> => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const { couponCode, hasCoupon, isGuestCheckout, ...orderData } = req.body;
    let couponApplied = false;
    let userId = null;

    // Handle guest checkout
    if (!isGuestCheckout && !req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required for non-guest checkout');
    }

    // If not guest checkout, get user ID
    if (!isGuestCheckout && req.user) {
      userId = req.user.userId;
    }

    if (hasCoupon) {
      const couponExist = await Coupon.findOne({ code: couponCode }).session(session);
      if (!couponExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Coupon not found');
      }
      couponApplied = true;
    }

    // Create the order
    const order = await Order.create(
      [
        {
          ...orderData,
          hasCoupon: couponApplied,
          couponCode: couponApplied ? couponCode : undefined,
          userId: userId,
          isGuestCheckout: isGuestCheckout || false
        }
      ],
      { session }
    );

    // If user is authenticated, add order to user's orders array
    if (userId) {
      await User.findByIdAndUpdate(userId, { $push: { orders: order[0]._id } }, { session });
    }

    // Reduce the quantity and update stock only if order creation is successful
    const products = await Product.find({
      _id: { $in: order[0].orderItems.map((item) => item.productId) }
    }).session(session);

    for (const product of products) {
      const orderItem = order[0].orderItems.find(
        (orderItem) => orderItem.productId.toString() === product._id.toString()
      );

      if (orderItem) {
        const updateData: any = {};

        // Handle variant products
        if (product.hasVariants && orderItem.variants && orderItem.variants.length > 0) {
          // Extract variant data from the order
          const variantSelections = orderItem.variants;

          // Create a deep copy of the product variants to avoid direct mutation
          const updatedVariants = JSON.parse(JSON.stringify(product.variants));

          // Find matching variant combination and update its quantity
          if (updatedVariants && updatedVariants.length > 0) {
            for (const variant of updatedVariants) {
              if (variant.values && variant.values.length > 0) {
                // Update matching variant values
                for (const value of variant.values) {
                  // Check if this variant value matches what was ordered
                  const isSelected = variantSelections.some(
                    (selection) =>
                      selection.name.trim() === variant.name.trim() &&
                      selection.value.trim() === value.name.trim()
                  );

                  if (isSelected) {
                    // Check if there's enough stock in this variant
                    if (value.quantity < orderItem.quantity) {
                      throw new AppError(
                        httpStatus.BAD_REQUEST,
                        `Insufficient stock for product: ${product.name} (${variant.name}: ${value.name})`
                      );
                    }
                    // Reduce the variant quantity
                    value.quantity -= orderItem.quantity;
                  }
                }
              }
            }

            updateData.variants = updatedVariants;
          }
        } else {
          // Handle non-variant products
          if (product.quantity < orderItem.quantity) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              `Insufficient stock for product: ${product.name}`
            );
          }
          updateData.quantity = product.quantity - orderItem.quantity;
          updateData.stock = product.stock - orderItem.quantity;
        }

        // Update common product fields
        updateData.total_sale = (product.total_sale || 0) + orderItem.quantity;

        // Update the product with all changes
        await Product.updateOne({ _id: product._id }, { $set: updateData }, { session });
      }
    }

    // Fetch storefront data
    const storefront = await Storefront.findOne().session(session);
    if (!storefront) {
      throw new AppError(httpStatus.NOT_FOUND, 'Storefront data not found');
    }

    // Prepare and send the order confirmation email
    const url = `${req.protocol}://${req.get('host')}`;
    const emailData = {
      name: order[0].name,
      orderId: order[0]._id,
      invoiceLink: `${url}/api/v1/order/invoice/${order[0]._id}`,
      storefront
    };

    const html = await renderEjs('order.confirmation', emailData);

    await emailQueue.add(emailQueueName, {
      to: orderData.email,
      subject: `Order Confirmation - ${order[0]._id}`,
      body: html
    });

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateOrder = async (id: string, req: Request): Promise<IOrder | null> => {
  try {
    const order = await Order.findOne({ _id: id });
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'This order does not exist');
    }

    const result = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteOrder = async (id: string): Promise<void | null> => {
  try {
    const order = await Order.findOne({ _id: id });
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'This order is not found');
    }

    await Order.findByIdAndDelete(id);
    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateOrderStatus = async (id: string, newStatus: string): Promise<IOrder | null> => {
  try {
    // Retrieve order
    const order = await Order.findById(id);
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // Fetch user
    const user = await User.findOne({ email: order.email });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Fetch storefront data
    const storefront = await Storefront.findOne();
    if (!storefront) {
      throw new AppError(httpStatus.NOT_FOUND, 'Storefront data not found');
    }

    // Update order status
    order.status = newStatus as any;
    const updatedOrder = await order.save();

    // Prepare email data
    const emailData = {
      name: order.name,
      orderId: order._id,
      status: newStatus,
      storefront
    };

    // Render email template
    const html = await renderEjs('order.status', emailData);

    // Add email to queue
    await emailQueue.add(emailQueueName, {
      to: order.email,
      subject: `Order Status Update - ${order._id}`,
      body: html
    });

    return updatedOrder;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to update order status'
    );
  }
};

export const orderTracker = async (req: Request): Promise<IOrder[]> => {
  try {
    const { identifier } = req.params;

    const query: any = {};

    if (identifier.includes('@')) {
      query.email = identifier;
    } else if (ObjectId.isValid(identifier)) {
      const order = await Order.findById(identifier);
      if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
      }
      return [order];
    } else {
      const phoneNumber = identifier.replace(/^\+/, '');
      query.$or = [
        { phone: phoneNumber },
        { phone: { $regex: phoneNumber + '$' } },
        { phone: { $regex: '^\\+' + phoneNumber } }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'No orders found');
    }

    return orders;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const generateInvoicePDF = async (orderId: string): Promise<Buffer> => {
  const order: IOrder | null = await Order.findById(orderId).populate('orderItems.productId');
  if (!order) {
    throw new Error('Order not found');
  }

  const storefront = await Storefront.findOne();
  if (!storefront) {
    throw new Error('Storefront data not found');
  }

  const filePath = join(process.cwd(), 'views', 'invoice.ejs');
  const html = await new Promise<string>((resolve, reject) => {
    renderFile(filePath, { order, storefront }, (err, str) => {
      if (err) return reject(err);
      resolve(str);
    });
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdfBuffer;
};

export const orderService = {
  getAllOrder,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  orderTracker,
  generateInvoicePDF
};
