import Offers from './offers.model';
import { IOffers } from './offers.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import Product from '../product/product.model';
import { Types } from 'mongoose';

export const getAllOffers = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const offersQuery = new QueryBuilder(
      Offers.find().populate([
        {
          path: 'products',
          populate: {
            path: 'category'
          }
        }
      ]),
      query
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await offersQuery.countTotal();
    const result = await offersQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getOffersProducts = async (query: Record<string, unknown>): Promise<any> => {
  try {
    // get all the that products whose are not in any offers
    const searchABleFields = ['name'];
    const productsQuery = new QueryBuilder(
      Product.find({
        _id: {
          $nin: (await Offers.distinct('products')).map(
            (product: any) => new Types.ObjectId(product.toHexString())
          )
        },
        isDeleted: false
      }).populate(
        'category brand subCategory productUnit defaultSaleUnit defaultSaleUnit defaultPurchaseUnit productTax'
      ),
      query
    )
      .filter()
      .search(searchABleFields)
      .sort()
      .paginate()
      .fields();

    const meta = await productsQuery.countTotal();
    const result = await productsQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getOffersById = async (req: Request): Promise<any> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const searchTerm = req.query.searchTerm as string;

    const offers = await Offers.findOne({ _id: id });
    if (!offers) {
      throw new AppError(httpStatus.NOT_FOUND, 'This offer is not found');
    }

    const totalProducts = await Offers.aggregate([
      { $match: { _id: offers._id } },
      { $unwind: '$products' },
      { $count: 'total' }
    ]);

    const total = totalProducts[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const products = await Offers.findOne({ _id: id })
      .populate({
        path: 'products',
        options: {
          skip: (page - 1) * limit,
          limit
        },
        match: {
          name: searchTerm ? { $regex: searchTerm, $options: 'i' } : { $exists: true }
        },
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' },
          { path: 'productUnit', select: 'name' },
          { path: 'defaultSaleUnit', select: 'name' },
          { path: 'defaultPurchaseUnit', select: 'name' },
          { path: 'productTax', select: 'name' },
          { path: 'supplier', select: 'company' }
        ]
      })
      .select('products');

    if (!products) {
      throw new AppError(httpStatus.NOT_FOUND, 'This offer is not found');
    }

    const result = {
      ...offers.toJSON(),
      products: {
        products: products.products,
        meta: {
          total,
          page,
          limit,
          totalPages
        }
      }
    };

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createOffers = async (req: Request): Promise<IOffers | null> => {
  try {
    const { title, subTitle, startDate, endDate, products, status } = req.body;

    const isExist = await Offers.findOne({ title });
    if (isExist) {
      throw new AppError(httpStatus.CONFLICT, 'This offers already exists, please try another one');
    }
    const isProductExist = await Product.find({
      _id: { $in: products },
      isDeleted: false
    });
    if (isProductExist.length !== products.length) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This product does not exist, please try another one'
      );
    }

    // check this product is already in any offers
    const isProductInOffers = await Offers.findOne({
      products: { $in: products }
    });
    if (isProductInOffers) {
      throw new AppError(httpStatus.CONFLICT, 'This product is already in another offers');
    }

    // check startDate and endDate
    if (new Date(startDate) > new Date(endDate)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'End date should be greater than start date');
    }

    const result = await Offers.create({
      title,
      subTitle,
      startDate,
      endDate,
      products,
      status
    });
    return result;
  } catch (error: any) {
    console.log(error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const updateOffers = async (id: string, req: Request): Promise<IOffers | null> => {
  try {
    const offers = await Offers.findOne({ _id: id });
    if (!offers) {
      throw new AppError(httpStatus.NOT_FOUND, 'This offers does not exist');
    }

    const {
      title,
      subTitle,
      startDate,
      endDate,
      products,
      status,
      productId,
      action,
      id: offerId,
      ...remainingStudentData
    } = req.body;

    const isExist = await Offers.findById(offerId);
    if (!isExist) {
      throw new AppError(httpStatus.CONFLICT, "This offer doesn't exist");
    }

    if (productId && action === 'remove') {
      await Offers.findByIdAndUpdate(offerId, {
        $pull: { products: productId }
      });
    }

    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    if (title) {
      modifiedUpdatedData.title = title;
    }

    if (subTitle) {
      modifiedUpdatedData.subTitle = subTitle;
    }

    if (startDate) {
      // check startDate and endDate
      if (new Date(startDate) > new Date(endDate)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'End date should be greater than start date');
      }
      modifiedUpdatedData.startDate = startDate;
    }

    if (endDate) {
      // check startDate and endDate
      if (new Date(startDate) > new Date(endDate)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'End date should be greater than start date');
      }
      modifiedUpdatedData.endDate = endDate;
    }

    // update products if it is provided and check if it is valid or not and check if it is already in any offers
    if (products) {
      const isProductExist = await Product.find({
        _id: { $in: products },
        isDeleted: false
      });
      if (isProductExist.length !== products.length) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'This product does not exist, please try another one'
        );
      }

      const isProductInOffers = await Offers.findOne({
        products: { $in: products }
      });
      if (isProductInOffers) {
        throw new AppError(httpStatus.CONFLICT, 'This product is already in another offers');
      }

      modifiedUpdatedData.products = [...products, ...offers.products];
    }

    if (status) {
      modifiedUpdatedData.status = status;
    }

    const result = await Offers.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const deleteOffers = async (id: string): Promise<void | null> => {
  try {
    const offers = await Offers.findOne({ _id: id });
    if (!offers) {
      throw new AppError(httpStatus.NOT_FOUND, 'This offers is not found');
    }

    await Offers.findByIdAndDelete(id);

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const offersService = {
  getAllOffers,
  getOffersById,
  createOffers,
  updateOffers,
  deleteOffers,
  getOffersProducts
};
