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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseService = exports.generatePurchasePdf = exports.deletePurchase = exports.updatePurchase = exports.createPurchase = exports.getPurchaseById = exports.getAllPurchases = void 0;
const purchase_model_1 = __importDefault(require("./purchase.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const supplier_model_1 = __importDefault(require("../supplier/supplier.model"));
const tax_model_1 = __importDefault(require("../tax/tax.model"));
const image_gallery_model_1 = require("../image-gallery/image-gallery.model");
const cloudinary_1 = require("../../utils/cloudinary");
const puppeteer_1 = __importDefault(require("puppeteer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const storefront_model_1 = __importDefault(require("../storefront/storefront.model"));
const attachDocumentToPurchase = (req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return null;
    const folderName = 'PurchaseAttachments';
    let folder = yield image_gallery_model_1.FolderModel.findOne({ name: folderName });
    if (!folder) {
        folder = yield image_gallery_model_1.FolderModel.create({ name: folderName });
    }
    const uploadResult = (yield (0, cloudinary_1.saveAttachment)(req.file));
    yield image_gallery_model_1.ImageGalleryModel.create({
        folder: folder._id,
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url
    });
    return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
    };
});
const checkExistence = (id, model, entityName) => __awaiter(void 0, void 0, void 0, function* () {
    const entity = yield model.findById(id);
    if (!entity) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, `${entityName} with ID ${id} not found`);
    }
});
const getAllPurchases = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchaseQuery = new QueryBuilder_1.default(purchase_model_1.default.find({}), query)
            .search(['reference'])
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield purchaseQuery.countTotal();
        const result = yield purchaseQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllPurchases = getAllPurchases;
const getPurchaseById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchase = yield purchase_model_1.default.findById(id).populate('supplier orderTax');
        if (!purchase) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This purchase is not found');
        }
        return purchase;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getPurchaseById = getPurchaseById;
const createPurchase = (req) => __awaiter(void 0, void 0, void 0, function* () {
    let session = null;
    try {
        const { items, supplier, orderTax } = req.body;
        // Start a session for transaction
        session = yield mongoose_1.default.startSession();
        session.startTransaction();
        // Validate supplier and products
        yield Promise.all([
            checkExistence(supplier, supplier_model_1.default, 'Supplier'),
            ...items.map((item) => checkExistence(item.product_id, product_model_1.default, 'Product')),
            orderTax && checkExistence(orderTax, tax_model_1.default, 'Tax')
        ]);
        // Apply tax and discount to each item
        const updatedItems = yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const product = (yield product_model_1.default.findById(item.product_id)
                .populate('productTax')
                .session(session));
            if (!product) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
            }
            const tax = (product === null || product === void 0 ? void 0 : product.productTax)
                ? product.productTax.type === 'Fixed'
                    ? product.productTax.rate
                    : (product.productTax.rate / 100) * item.unit_price
                : 0;
            const discount = Number(item.discount) || 0;
            // Calculate sub_total
            item.sub_total = Number(item.unit_price) * Number(item.quantity) - discount + tax;
            item.tax = tax;
            item.discount = discount;
            return item;
        })));
        req.body.items = updatedItems;
        req.body.attachDocument = yield attachDocumentToPurchase(req);
        // Increment the product quantity and stock value
        yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const product = (yield product_model_1.default.findById(item.product_id).session(session));
            if (!product) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
            }
            const quantity = Number(product.quantity) + Number(item.quantity);
            const stock = Number(product.quantity) + Number(item.quantity);
            // Update product fields
            product.quantity = quantity;
            product.stock = stock;
            // Save the updated product
            yield product.save({ session });
        })));
        // Create the purchase
        const purchase = yield purchase_model_1.default.create([req.body], { session });
        // Commit the transaction
        yield session.commitTransaction();
        session.endSession();
        return purchase[0];
    }
    catch (error) {
        if (session) {
            yield session.abortTransaction();
            session.endSession();
        }
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createPurchase = createPurchase;
const updatePurchase = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { items, supplier, orderTax } = req.body;
        const purchase = yield purchase_model_1.default.findById(id);
        if (!purchase) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This purchase does not exist');
        }
        // Check if supplier, products, and tax exist
        yield Promise.all([
            checkExistence(supplier, supplier_model_1.default, 'Supplier'),
            ...items.map((item) => checkExistence(item.product_id, product_model_1.default, 'Product')),
            orderTax && checkExistence(orderTax, tax_model_1.default, 'Tax')
        ]);
        if (req.file) {
            const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: (_a = purchase.attachDocument) === null || _a === void 0 ? void 0 : _a.url });
            if (image) {
                yield (0, cloudinary_1.deleteAttachment)(image.public_id);
            }
            req.body.attachDocument = yield attachDocumentToPurchase(req);
        }
        return yield purchase_model_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updatePurchase = updatePurchase;
const deletePurchase = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const purchase = yield purchase_model_1.default.findById(id);
        if (!purchase) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This purchase is not found');
        }
        if ((_b = purchase.attachDocument) === null || _b === void 0 ? void 0 : _b.url) {
            const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: purchase.attachDocument.url });
            if (image) {
                yield (0, cloudinary_1.deleteAttachment)(image.public_id);
            }
        }
        yield purchase_model_1.default.findByIdAndDelete(id);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deletePurchase = deletePurchase;
const generatePurchasePdf = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchase = (yield purchase_model_1.default.findById(id).populate('supplier orderTax'));
        if (!purchase) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Purchase not found');
        }
        const storefront = yield storefront_model_1.default.findOne();
        if (!storefront) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Storefront not found');
        }
        // Render the EJS template to HTML
        const templatePath = path_1.default.join(__dirname, '../../templates/purchase.ejs');
        const html = yield ejs_1.default.renderFile(templatePath, { purchase, storefront });
        // Launch Puppeteer and generate the PDF
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = yield page.pdf({ format: 'A4' });
        yield browser.close();
        return pdfBuffer;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.generatePurchasePdf = generatePurchasePdf;
exports.purchaseService = {
    getAllPurchases: exports.getAllPurchases,
    getPurchaseById: exports.getPurchaseById,
    createPurchase: exports.createPurchase,
    updatePurchase: exports.updatePurchase,
    deletePurchase: exports.deletePurchase,
    generatePurchasePdf: exports.generatePurchasePdf
};
