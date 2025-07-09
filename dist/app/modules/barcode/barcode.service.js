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
exports.barcodeService = exports.deleteBarcode = exports.updateBarcode = exports.createBarcode = exports.getBarcodeById = exports.getAllBarcode = void 0;
const barcode_model_1 = __importDefault(require("./barcode.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const generateBarcode_1 = __importDefault(require("../../utils/generateBarcode"));
const product_model_1 = __importDefault(require("../product/product.model"));
const getAllBarcode = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const barcodeSearchableFields = ['name'];
    const barcodeQuery = new QueryBuilder_1.default(barcode_model_1.default.find({
        isDeleted: false
    }), query)
        .search(barcodeSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield barcodeQuery.countTotal();
    const result = yield barcodeQuery.queryModel;
    return { meta, result };
});
exports.getAllBarcode = getAllBarcode;
const getBarcodeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const barcode = yield barcode_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!barcode) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This barcode is not found');
    }
    return barcode;
});
exports.getBarcodeById = getBarcodeById;
const createBarcode = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, product_id } = req.body;
        if (yield barcode_model_1.default.isBarcodeExist(name)) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'The barcode already exists with this name');
        }
        const product = yield product_model_1.default.findById(product_id);
        if (!product) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product is not found');
        }
        const productBarcode = yield barcode_model_1.default.findOne({ product_id });
        if (productBarcode) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This product already has a barcode');
        }
        const result = (yield (0, generateBarcode_1.default)(product_id));
        if (!result) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error generating or uploading barcode');
        }
        const barcodeData = {
            name,
            slug: name.toLowerCase().replace(/ /g, '-') +
                '_barcode_' +
                Math.floor(Math.random() * 1000),
            description,
            product_id,
            barcode: {
                url: result.secure_url,
                public_id: result.public_id
            }
        };
        const data = yield barcode_model_1.default.create(barcodeData);
        return data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.createBarcode = createBarcode;
const updateBarcode = () => __awaiter(void 0, void 0, void 0, function* () { });
exports.updateBarcode = updateBarcode;
const deleteBarcode = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const barcode = yield barcode_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!barcode) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This barcode does not exist');
    }
    yield barcode_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    return null;
});
exports.deleteBarcode = deleteBarcode;
exports.barcodeService = {
    getAllBarcode: exports.getAllBarcode,
    getBarcodeById: exports.getBarcodeById,
    createBarcode: exports.createBarcode,
    updateBarcode: exports.updateBarcode,
    deleteBarcode: exports.deleteBarcode
};
