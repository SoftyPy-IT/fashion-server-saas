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
exports.updateStockSchema = exports.createStockSchema = void 0;
const z = __importStar(require("zod"));
exports.createStockSchema = z.object({
    startDate: z
        .string({
        required_error: 'Start Date is required'
    })
        .transform((str) => new Date(str)),
    endDate: z
        .string({
        required_error: 'End Date is required'
    })
        .transform((str) => new Date(str)),
    reference: z.string(),
    type: z.enum(['Partial', 'Full']),
    brands: z.array(z.string()).optional(), // Assuming you use ObjectId as string for brands
    categories: z.array(z.string()).optional(), // Assuming you use ObjectId as string for categories
    initialStockCSV: z.string().optional(),
    finalStockCSV: z.string().optional(),
    isFinalCalculation: z.boolean().default(false),
    note: z.string().optional()
});
exports.updateStockSchema = z.object({});
