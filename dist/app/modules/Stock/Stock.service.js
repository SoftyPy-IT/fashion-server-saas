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
exports.StockService = exports.deleteStock = exports.updateStock = exports.createStock = exports.getStockById = exports.getAllStock = void 0;
const Stock_model_1 = __importDefault(require("./Stock.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const fs_1 = __importDefault(require("fs"));
const stock_utils_1 = require("./stock.utils");
const cloudinary_1 = require("../../utils/cloudinary");
const getAllStock = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const StockSearchableFields = ['name'];
        const StockQuery = new QueryBuilder_1.default(Stock_model_1.default.find({}).populate([
            {
                path: 'brands',
                select: 'name description image'
            },
            {
                path: 'categories',
                select: 'name description image'
            }
        ]), query)
            .search(StockSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield StockQuery.countTotal();
        const result = yield StockQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllStock = getAllStock;
const getStockById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stock = yield Stock_model_1.default.findOne({ _id: id }).populate([
            {
                path: 'brands',
                select: 'name description image'
            },
            {
                path: 'categories',
                select: 'name description image'
            }
        ]);
        if (!stock) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This Stock is not found');
        }
        if (stock.isFinalCalculation) {
            const totalDifference = stock.counts.reduce((sum, count) => sum + count.difference, 0);
            const totalCost = stock.counts.reduce((sum, count) => sum + count.cost, 0);
            stock.set('totalDifference', totalDifference, { strict: false });
            stock.set('totalCost', totalCost, { strict: false });
        }
        return stock;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getStockById = getStockById;
const createStock = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, stock_utils_1.getProducts)(req.body);
        // Check if products exist based on the criteria
        if (!products || products.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No products found based on the provided criteria');
        }
        const filePath = yield (0, stock_utils_1.generateCSVFile)(products);
        const { url, public_id } = yield (0, stock_utils_1.uploadToCloudinary)(filePath);
        fs_1.default.unlinkSync(filePath);
        // Create the stock entry after confirming products exist
        const stockData = Object.assign(Object.assign({}, req.body), { initialStockCSV: { url, publicId: public_id } });
        const result = yield Stock_model_1.default.create(stockData);
        return {
            success: true,
            message: 'Stock created successfully',
            data: result
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createStock = createStock;
const updateStock = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stockExist = yield Stock_model_1.default.findById(id);
        if (!stockExist) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This Stock does not exist');
        }
        if (stockExist.isFinalCalculation) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You can't update a stock that has been finalized");
        }
        const { file } = req;
        if (!file || file.mimetype !== 'text/csv') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No file uploaded or file is not a CSV');
        }
        // Upload the CSV file to Cloudinary and get the URL
        const { url, public_id } = yield (0, stock_utils_1.uploadToCloudinary)(file);
        // Update the Stock model with the final CSV details
        stockExist.finalStockCSV = { url, publicId: public_id };
        stockExist.note = req.body.note;
        stockExist.isFinalCalculation = true;
        // Parse the initial and final CSV data
        const initialData = yield (0, stock_utils_1.parseCSV)(stockExist.initialStockCSV.url);
        const finalData = yield (0, stock_utils_1.parseCSV)(url);
        // Calculate the differences between initial and final data
        const comparisonData = yield (0, stock_utils_1.calculateDifferences)(initialData, finalData);
        // Update the counts in the stock model
        stockExist.counts = comparisonData === null || comparisonData === void 0 ? void 0 : comparisonData.map((item, index) => ({
            no: index + 1,
            description: item === null || item === void 0 ? void 0 : item.Description,
            expected: item === null || item === void 0 ? void 0 : item.Expected,
            counted: item === null || item === void 0 ? void 0 : item.Counted,
            difference: item === null || item === void 0 ? void 0 : item.Difference,
            cost: item === null || item === void 0 ? void 0 : item.Cost
        }));
        // Save the updated stock model
        yield stockExist.save();
        return stockExist.counts;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateStock = updateStock;
const deleteStock = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const StockExist = yield Stock_model_1.default.findOne({ _id: id });
        if (!StockExist) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This Stock is not found');
        }
        // delete the initaial and final CSV files from Cloudinary
        yield (0, cloudinary_1.deleteAttachment)(StockExist.initialStockCSV.publicId);
        if (StockExist.isFinalCalculation) {
            yield (0, cloudinary_1.deleteAttachment)((_a = StockExist === null || StockExist === void 0 ? void 0 : StockExist.finalStockCSV) === null || _a === void 0 ? void 0 : _a.publicId);
        }
        yield Stock_model_1.default.findByIdAndDelete(id);
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteStock = deleteStock;
exports.StockService = {
    getAllStock: exports.getAllStock,
    getStockById: exports.getStockById,
    createStock: exports.createStock,
    updateStock: exports.updateStock,
    deleteStock: exports.deleteStock
};
