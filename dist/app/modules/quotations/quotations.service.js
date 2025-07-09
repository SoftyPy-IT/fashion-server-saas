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
exports.quotationsService = exports.generateQuotationPdf = exports.deleteQuotations = exports.updateQuotations = exports.createQuotations = exports.getQuotationsById = exports.getAllQuotations = exports.attachDocumentToQuotations = void 0;
const quotations_model_1 = __importDefault(require("./quotations.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const image_gallery_model_1 = require("../image-gallery/image-gallery.model");
const cloudinary_1 = require("../../utils/cloudinary");
const product_model_1 = __importDefault(require("../product/product.model"));
const Billers_model_1 = __importDefault(require("../Billers/Billers.model"));
const Customers_model_1 = __importDefault(require("../Customers/Customers.model"));
const supplier_model_1 = __importDefault(require("../supplier/supplier.model"));
const tax_model_1 = __importDefault(require("../tax/tax.model"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const storefront_model_1 = __importDefault(require("../storefront/storefront.model"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const attachDocumentToQuotations = (req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return null;
    const folderName = 'Attachments';
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
exports.attachDocumentToQuotations = attachDocumentToQuotations;
const checkExistence = (id, model, entityName) => __awaiter(void 0, void 0, void 0, function* () {
    const entity = yield model.findById(id);
    if (!entity) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, `${entityName} with ID ${id} not found`);
    }
});
const getAllQuotations = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quotationsQuery = new QueryBuilder_1.default(quotations_model_1.default.find({}), query)
            .search(['name'])
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield quotationsQuery.countTotal();
        const result = yield quotationsQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllQuotations = getAllQuotations;
const getQuotationsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quotations = yield quotations_model_1.default.findById(id).populate('biller tax supplier customer');
        if (!quotations) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Quotation not found');
        }
        return quotations;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getQuotationsById = getQuotationsById;
const createQuotations = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items, biller, customer, supplier, tax } = req.body;
        // Check if each product, biller, customer, and supplier exist
        yield Promise.all([
            ...items.map((item) => checkExistence(item.product_id, product_model_1.default, 'Product')),
            checkExistence(biller, Billers_model_1.default, 'Biller'),
            checkExistence(customer, Customers_model_1.default, 'Customer'),
            checkExistence(supplier, supplier_model_1.default, 'Supplier'),
            tax && checkExistence(tax, tax_model_1.default, 'Tax')
        ]);
        // Apply product tax and discount to each item
        req.body.items = yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const product = (yield product_model_1.default.findById(item.product_id).populate('productTax'));
            if (!product) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
            }
            // Calculate tax if applicable
            const tax = (product === null || product === void 0 ? void 0 : product.productTax)
                ? product.productTax.type === 'Fixed'
                    ? product.productTax.rate
                    : (product.productTax.rate / 100) * item.unit_price
                : 0;
            const discount = Number(product.discount_price) || 0;
            // Calculate sub_total
            item.sub_total = Number(item.unit_price) * Number(item.quantity) - discount + tax;
            item.tax = tax; // Include the tax in the item if applicable
            item.discount = discount;
            return item;
        })));
        req.body.attachDocument = yield (0, exports.attachDocumentToQuotations)(req);
        return yield quotations_model_1.default.create(req.body);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createQuotations = createQuotations;
const updateQuotations = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items, biller, customer, supplier, tax } = req.body;
        const quotations = yield quotations_model_1.default.findById(id);
        if (!quotations) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Quotation not found');
        }
        // Check if each product, biller, customer, and supplier exist
        yield Promise.all([
            ...items.map((item) => checkExistence(item.product_id, product_model_1.default, 'Product')),
            checkExistence(biller, Billers_model_1.default, 'Biller'),
            checkExistence(customer, Customers_model_1.default, 'Customer'),
            checkExistence(supplier, supplier_model_1.default, 'Supplier'),
            checkExistence(tax, tax_model_1.default, 'Tax')
        ]);
        if (req.file) {
            const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: quotations.attachDocument });
            if (image) {
                yield (0, cloudinary_1.deleteAttachment)(image.public_id);
            }
            req.body.attachDocument = yield (0, exports.attachDocumentToQuotations)(req);
        }
        return yield quotations_model_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateQuotations = updateQuotations;
const deleteQuotations = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quotations = yield quotations_model_1.default.findById(id);
        if (!quotations) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Quotation not found');
        }
        const image = yield image_gallery_model_1.ImageGalleryModel.findOne({ url: quotations.attachDocument });
        if (image) {
            yield (0, cloudinary_1.deleteAttachment)(image.public_id);
        }
        yield quotations_model_1.default.findByIdAndDelete(id);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteQuotations = deleteQuotations;
const generateQuotationPdf = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quotation = (yield quotations_model_1.default.findById(id).populate('biller customer supplier'));
        if (!quotation) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Quotation not found');
        }
        const storefront = yield storefront_model_1.default.findOne();
        if (!storefront) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Storefront not found');
        }
        // Render the EJS template to HTML
        const templatePath = path_1.default.join(__dirname, '../../templates/quotation-template.ejs');
        const htmlContent = yield ejs_1.default.renderFile(templatePath, { quotation, storefront });
        // Launch Puppeteer and generate the PDF
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = yield browser.newPage();
        yield page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = yield page.pdf({ format: 'A4' });
        yield browser.close();
        return pdfBuffer;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.generateQuotationPdf = generateQuotationPdf;
exports.quotationsService = {
    getAllQuotations: exports.getAllQuotations,
    getQuotationsById: exports.getQuotationsById,
    createQuotations: exports.createQuotations,
    updateQuotations: exports.updateQuotations,
    deleteQuotations: exports.deleteQuotations,
    generateQuotationPdf: exports.generateQuotationPdf
};
