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
exports.calculateDifferences = exports.generateCSVFile = exports.getProducts = exports.parseCSV = exports.uploadToCloudinary = void 0;
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const https_1 = __importDefault(require("https"));
const json2csv_1 = require("json2csv");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const cloudinary_1 = require("../../utils/cloudinary");
const uploadToCloudinary = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicId = `stock_files-${crypto_1.default.randomBytes(10).toString('hex')}`;
        let result;
        if (typeof filePath === 'string') {
            // Upload using a file path string
            result = yield cloudinary_1.cloudinaryConfig.uploader.upload(filePath, {
                resource_type: 'raw',
                folder: 'stock_files',
                public_id: publicId,
                overwrite: true
            });
        }
        else if (filePath && filePath.path) {
            // Upload using an Express.Multer.File object's path
            result = yield cloudinary_1.cloudinaryConfig.uploader.upload(filePath.path, {
                resource_type: 'raw',
                folder: 'stock_files',
                public_id: `${publicId}-${filePath.originalname}`,
                overwrite: true
            });
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid file path or file object');
        }
        if (!result) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error uploading file to Cloudinary');
        }
        return { url: result.secure_url, public_id: result.public_id };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Error uploading file to Cloudinary');
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
const parseCSV = (url) => {
    return new Promise((resolve, reject) => {
        const results = [];
        https_1.default
            .get(url, (res) => {
            if (res.statusCode && res.statusCode >= 400) {
                return reject(new AppError_1.default(http_status_1.default.BAD_REQUEST, `Failed to fetch CSV file: ${res.statusCode}`));
            }
            res
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', () => reject(new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error parsing CSV file')));
        })
            .on('error', (error) => reject(new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message)));
    });
};
exports.parseCSV = parseCSV;
const getProducts = (stockData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const query = { isDeleted: false };
        if (stockData.type === 'Partial') {
            if (((_a = stockData.brands) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                query.brand = { $in: stockData.brands };
            }
            else if (((_b = stockData.categories) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                query.category = { $in: stockData.categories };
            }
        }
        if (stockData.startDate && stockData.endDate) {
            console.log(`Using date range: ${stockData.startDate} - ${stockData.endDate}`);
            query.createdAt = { $gte: new Date(stockData.startDate), $lte: new Date(stockData.endDate) };
        }
        console.log(`Query: ${JSON.stringify(query)}`);
        const products = yield product_model_1.default.find(query);
        if (!products || products.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No products found');
        }
        return products;
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getProducts = getProducts;
const generateCSVFile = (products) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const csvFields = ['Name', 'Code', 'Variants', 'Expected', 'Counted'];
        const csvData = products.map((product) => {
            var _a;
            return ({
                Name: product.name,
                Code: product.code,
                Variants: (_a = product.variants) === null || _a === void 0 ? void 0 : _a.map((variant) => `${variant.name} - ${variant.values.map((value) => value.name).join(', ')}`).join('; '),
                Expected: product.stock,
                Counted: ''
            });
        });
        const csv = (0, json2csv_1.parse)(csvData, { fields: csvFields });
        const fileName = `stock_${Date.now()}.csv`;
        const filePath = path_1.default.join(__dirname, fileName);
        fs_1.default.writeFileSync(filePath, csv);
        return filePath;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error generating CSV file');
    }
});
exports.generateCSVFile = generateCSVFile;
const calculateDifferences = (initialData, finalData) => __awaiter(void 0, void 0, void 0, function* () {
    const differences = yield Promise.all(initialData.map((initialProduct) => __awaiter(void 0, void 0, void 0, function* () {
        const finalProduct = finalData.find((p) => p.Code === initialProduct.Code);
        if (!finalProduct)
            return null;
        const expected = parseInt(initialProduct.Expected, 10) || 0;
        const counted = parseInt(finalProduct.Counted, 10) || 0;
        const difference = counted - expected;
        // Find the product by name or code to get the product cost
        const product = yield product_model_1.default.findOne({
            $or: [{ name: initialProduct.Name }, { code: finalProduct.Code }]
        });
        const productCost = product ? product.productCost : 0;
        return {
            No: initialProduct.No,
            Description: initialProduct.Name,
            Expected: expected,
            Counted: counted,
            Difference: difference,
            Cost: productCost
        };
    })));
    return differences.filter((item) => item !== null);
});
exports.calculateDifferences = calculateDifferences;
