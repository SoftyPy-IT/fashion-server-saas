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
exports.updatePurchaseSchema = exports.createPurchaseSchema = void 0;
const z = __importStar(require("zod"));
const itemSchema = z.object({
    product_name: z.string().nonempty(),
    product_code: z.string().nonempty(),
    product_id: z
        .string()
        .nonempty()
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid ObjectId format for product_id'
    }),
    unit_price: z
        .string()
        .refine((val) => !isNaN(Number(val)), {
        message: 'unit_price must be a valid number'
    })
        .transform(Number),
    quantity: z
        .string()
        .refine((val) => !isNaN(Number(val)), {
        message: 'quantity must be a valid number'
    })
        .transform(Number),
    discount: z
        .string()
        .optional()
        .refine((val) => !isNaN(Number(val)), {
        message: 'discount must be a valid number'
    })
        .transform((val) => (val ? Number(val) : 0)),
    tax: z
        .string()
        .optional()
        .refine((val) => !isNaN(Number(val)), {
        message: 'tax must be a valid number'
    })
        .transform((val) => (val ? Number(val) : 0)),
    sub_total: z
        .string()
        .refine((val) => !isNaN(Number(val)), {
        message: 'sub_total must be a valid number'
    })
        .transform(Number)
});
exports.createPurchaseSchema = z.object({
    date: z
        .string({
        required_error: 'date is required',
        invalid_type_error: 'date must be a string'
    })
        .transform((val) => (val !== undefined ? new Date(val) : undefined)),
    reference: z
        .string({
        required_error: 'reference is required',
        invalid_type_error: 'reference must be a string'
    })
        .nonempty(),
    status: z.enum(['Pending', 'Ordered', 'Received'], {
        message: 'status must be one of "Pending", "Ordered", "Received"'
    }),
    supplier: z
        .string({
        required_error: 'supplier is required',
        invalid_type_error: 'supplier must be a string'
    })
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid ObjectId format for supplier'
    }),
    items: z.array(itemSchema, {
        message: 'Please provide a purchase item'
    }),
    orderTax: z
        .string()
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid ObjectId format for orderTax'
    })
        .optional(),
    discount: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 0))
        .refine((val) => !isNaN(Number(val)), {
        message: 'discount must be a valid number'
    }),
    shipping: z
        .string()
        .optional()
        .refine((val) => !isNaN(Number(val)), {
        message: 'shipping must be a valid number'
    })
        .transform((val) => (val ? Number(val) : 0)),
    paymentTerms: z.string().optional(),
    note: z.string().optional()
});
exports.updatePurchaseSchema = exports.createPurchaseSchema.partial();
