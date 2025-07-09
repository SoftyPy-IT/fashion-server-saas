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
exports.applyCouponSchema = exports.updateCouponSchema = exports.createCouponSchema = void 0;
const z = __importStar(require("zod"));
exports.createCouponSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    discount: z.number().positive('Discount must be a positive number'),
    discountType: z.enum(['percentage', 'flat']),
    expiryDate: z.string({
        required_error: 'Please provide coupon expiryDate',
        invalid_type_error: 'expiryDate should be a string'
    }),
    isActive: z.boolean().optional().default(true),
    limit: z.number().optional().default(50),
    totalUsed: z.number().optional().default(0)
});
exports.updateCouponSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    code: z.string().min(1, 'Code is required').optional(),
    discount: z.number().positive('Discount must be a positive number').optional(),
    discountType: z.enum(['percentage', 'flat']).optional(),
    expiryDate: z
        .string({
        invalid_type_error: 'expiryDate should be a string'
    })
        .optional(),
    isActive: z.boolean().optional(),
    limit: z.number().optional()
});
exports.applyCouponSchema = z.object({
    code: z.string().min(1, 'Code is required')
});
