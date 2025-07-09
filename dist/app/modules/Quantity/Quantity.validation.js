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
exports.updateQuantitySchema = exports.createQuantitySchema = exports.productSchema = void 0;
const z = __importStar(require("zod"));
exports.productSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    productCode: z.string(),
    type: z.enum(['Subtraction', 'Addition']),
    quantity: z.string(),
    serialNumber: z.string().optional(),
    variant: z
        .object({
        name: z.string().optional(),
        value: z.string().optional()
    })
        .optional()
});
exports.createQuantitySchema = z.object({
    date: z
        .string({
        required_error: 'Date is required'
    })
        .transform((str) => new Date(str)), // Transform to Date
    referenceNo: z.string({
        required_error: 'Reference number is required'
    }),
    products: z
        .array(exports.productSchema, {
        required_error: 'Please add at least one product'
    })
        .min(1),
    note: z.string({
        required_error: 'Note is required'
    })
});
exports.updateQuantitySchema = z.object({
    date: z
        .string()
        .transform((str) => new Date(str))
        .optional(), // Transform to Date
    referenceNo: z.string().optional(),
    attachDocument: z.string().optional(),
    products: z.array(exports.productSchema).optional(),
    note: z.string().optional()
});
