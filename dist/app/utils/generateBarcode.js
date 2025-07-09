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
const AppError_1 = __importDefault(require("../errors/AppError"));
const cloudinary_1 = require("./cloudinary");
const bwip_js_1 = __importDefault(require("bwip-js"));
function generateAndUploadBarcode(product_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Generate barcode as a PNG buffer
            const pngBuffer = yield bwip_js_1.default.toBuffer({
                bcid: 'code128', // Barcode type
                text: product_id.toString(), // Text to encode
                scale: 3, // Barcode scale factor
                includetext: true, // Include human-readable text below the barcode
                textxalign: 'center' // Horizontal text alignment
            });
            // Upload the barcode image to Cloudinary
            return new Promise((resolve, reject) => {
                cloudinary_1.cloudinaryConfig.uploader
                    .upload_stream({
                    folder: '/softypy/barcodes',
                    public_id: `barcode_${product_id}_${Date.now()}`,
                    resource_type: 'image',
                    format: 'png',
                    height: 306,
                    width: 441,
                    crop: 'fit'
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                })
                    .end(pngBuffer);
            });
        }
        catch (error) {
            console.log(error);
            throw new AppError_1.default(500, 'Error generating barcode');
        }
    });
}
exports.default = generateAndUploadBarcode;
