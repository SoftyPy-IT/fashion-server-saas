"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.generateInvoicePDF = exports.orderTracker = exports.updateOrderStatus = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrder = void 0;
const bson_1 = require("bson");
const ejs_1 = require("ejs");
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const helper_1 = require("../../utils/helper");
const coupon_model_1 = __importDefault(require("../coupon/coupon.model"));
const product_model_1 = __importDefault(require("../product/product.model"));
const storefront_model_1 = __importDefault(require("../storefront/storefront.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const order_model_1 = __importDefault(require("./order.model"));
const path_1 = require("path");
const EmailJob_1 = require("../../jobs/EmailJob");
const getAllOrder = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = query;
        const orderSearchableFields = ['name', 'email', 'phone'];
        const isObjectId = bson_1.ObjectId.isValid(searchTerm);
        let searchConditions = orderSearchableFields.map((field) => ({
            [field]: { $regex: String(searchTerm), $options: 'i' }
        }));
        if (isObjectId) {
            searchConditions = [{ _id: new bson_1.ObjectId(searchTerm) }, ...searchConditions];
        }
        let searchQuery = {};
        if (searchTerm) {
            searchQuery = searchConditions.length > 0 ? { $or: searchConditions } : {};
        }
        const orderQuery = new QueryBuilder_1.default(order_model_1.default.find(searchQuery), query)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield orderQuery.countTotal();
        const result = yield orderQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllOrder = getAllOrder;
const getOrderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findOne({ _id: id });
        if (!order) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This order is not found');
        }
        return order;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getOrderById = getOrderById;
const createOrder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const _a = req.body, { couponCode, hasCoupon, isGuestCheckout } = _a, orderData = __rest(_a, ["couponCode", "hasCoupon", "isGuestCheckout"]);
        let couponApplied = false;
        let userId = null;
        // Handle guest checkout
        if (!isGuestCheckout && !req.user) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Authentication required for non-guest checkout');
        }
        // If not guest checkout, get user ID
        if (!isGuestCheckout && req.user) {
            userId = req.user.userId;
        }
        if (hasCoupon) {
            const couponExist = yield coupon_model_1.default.findOne({ code: couponCode }).session(session);
            if (!couponExist) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Coupon not found');
            }
            couponApplied = true;
        }
        // Create the order
        const order = yield order_model_1.default.create([
            Object.assign(Object.assign({}, orderData), { hasCoupon: couponApplied, couponCode: couponApplied ? couponCode : undefined, userId: userId, isGuestCheckout: isGuestCheckout || false })
        ], { session });
        // If user is authenticated, add order to user's orders array
        if (userId) {
            yield user_model_1.default.findByIdAndUpdate(userId, { $push: { orders: order[0]._id } }, { session });
        }
        // Reduce the quantity and update stock only if order creation is successful
        const products = yield product_model_1.default.find({
            _id: { $in: order[0].orderItems.map((item) => item.productId) }
        }).session(session);
        for (const product of products) {
            const orderItem = order[0].orderItems.find((orderItem) => orderItem.productId.toString() === product._id.toString());
            if (orderItem) {
                const updateData = {};
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
                                    const isSelected = variantSelections.some((selection) => selection.name.trim() === variant.name.trim() &&
                                        selection.value.trim() === value.name.trim());
                                    if (isSelected) {
                                        // Check if there's enough stock in this variant
                                        if (value.quantity < orderItem.quantity) {
                                            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Insufficient stock for product: ${product.name} (${variant.name}: ${value.name})`);
                                        }
                                        // Reduce the variant quantity
                                        value.quantity -= orderItem.quantity;
                                    }
                                }
                            }
                        }
                        updateData.variants = updatedVariants;
                    }
                }
                else {
                    // Handle non-variant products
                    if (product.quantity < orderItem.quantity) {
                        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Insufficient stock for product: ${product.name}`);
                    }
                    updateData.quantity = product.quantity - orderItem.quantity;
                    updateData.stock = product.stock - orderItem.quantity;
                }
                // Update common product fields
                updateData.total_sale = (product.total_sale || 0) + orderItem.quantity;
                // Update the product with all changes
                yield product_model_1.default.updateOne({ _id: product._id }, { $set: updateData }, { session });
            }
        }
        // Fetch storefront data
        const storefront = yield storefront_model_1.default.findOne().session(session);
        if (!storefront) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Storefront data not found');
        }
        // Prepare and send the order confirmation email
        const url = `${req.protocol}://${req.get('host')}`;
        const emailData = {
            name: order[0].name,
            orderId: order[0]._id,
            invoiceLink: `${url}/api/v1/order/invoice/${order[0]._id}`,
            storefront
        };
        const html = yield (0, helper_1.renderEjs)('order.confirmation', emailData);
        yield EmailJob_1.emailQueue.add(EmailJob_1.emailQueueName, {
            to: orderData.email,
            subject: `Order Confirmation - ${order[0]._id}`,
            body: html
        });
        yield session.commitTransaction();
        session.endSession();
        return order[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createOrder = createOrder;
const updateOrder = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findOne({ _id: id });
        if (!order) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This order does not exist');
        }
        const result = yield order_model_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateOrder = updateOrder;
const deleteOrder = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findOne({ _id: id });
        if (!order) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This order is not found');
        }
        yield order_model_1.default.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteOrder = deleteOrder;
const updateOrderStatus = (id, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve order
        const order = yield order_model_1.default.findById(id);
        if (!order) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Order not found');
        }
        // Fetch user
        const user = yield user_model_1.default.findOne({ email: order.email });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        // Fetch storefront data
        const storefront = yield storefront_model_1.default.findOne();
        if (!storefront) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Storefront data not found');
        }
        // Update order status
        order.status = newStatus;
        const updatedOrder = yield order.save();
        // Prepare email data
        const emailData = {
            name: order.name,
            orderId: order._id,
            status: newStatus,
            storefront
        };
        // Render email template
        const html = yield (0, helper_1.renderEjs)('order.status', emailData);
        // Add email to queue
        yield EmailJob_1.emailQueue.add(EmailJob_1.emailQueueName, {
            to: order.email,
            subject: `Order Status Update - ${order._id}`,
            body: html
        });
        return updatedOrder;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to update order status');
    }
});
exports.updateOrderStatus = updateOrderStatus;
const orderTracker = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier } = req.params;
        const query = {};
        if (identifier.includes('@')) {
            query.email = identifier;
        }
        else if (bson_1.ObjectId.isValid(identifier)) {
            const order = yield order_model_1.default.findById(identifier);
            if (!order) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Order not found');
            }
            return [order];
        }
        else {
            const phoneNumber = identifier.replace(/^\+/, '');
            query.$or = [
                { phone: phoneNumber },
                { phone: { $regex: phoneNumber + '$' } },
                { phone: { $regex: '^\\+' + phoneNumber } }
            ];
        }
        const orders = yield order_model_1.default.find(query).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No orders found');
        }
        return orders;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.orderTracker = orderTracker;
const generateInvoicePDF = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findById(orderId).populate('orderItems.productId');
    if (!order) {
        throw new Error('Order not found');
    }
    const storefront = yield storefront_model_1.default.findOne();
    if (!storefront) {
        throw new Error('Storefront data not found');
    }
    const filePath = (0, path_1.join)(process.cwd(), 'views', 'invoice.ejs');
    const html = yield new Promise((resolve, reject) => {
        (0, ejs_1.renderFile)(filePath, { order, storefront }, (err, str) => {
            if (err)
                return reject(err);
            resolve(str);
        });
    });
    const browser = yield puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = yield browser.newPage();
    yield page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = yield page.pdf({ format: 'A4' });
    yield browser.close();
    return pdfBuffer;
});
exports.generateInvoicePDF = generateInvoicePDF;
exports.orderService = {
    getAllOrder: exports.getAllOrder,
    getOrderById: exports.getOrderById,
    createOrder: exports.createOrder,
    updateOrder: exports.updateOrder,
    deleteOrder: exports.deleteOrder,
    updateOrderStatus: exports.updateOrderStatus,
    orderTracker: exports.orderTracker,
    generateInvoicePDF: exports.generateInvoicePDF
};
