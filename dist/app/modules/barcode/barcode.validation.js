"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBarcodeSchema = exports.createBarcodeSchema = void 0;
const z = __importStar(require("zod"));
exports.createBarcodeSchema = z.object({
    name: z
        .string({
        required_error: 'Barcode must have a name',
        invalid_type_error: 'Name must be a string'
    })
        .min(1, { message: 'Barcode must have a name' }),
    description: z
        .string({
        required_error: 'Barcode must have a description',
        invalid_type_error: 'Description must be a string'
    })
        .max(255, { message: 'Description must not exceed 255 characters' }),
    product_id: z
        .string({
        required_error: 'Please select a product',
        invalid_type_error: 'Product ID must be a string'
    })
        .min(1, { message: 'Please select a product' })
});
exports.updateBarcodeSchema = z.object({
// Define updateBarcode schema properties here
});
