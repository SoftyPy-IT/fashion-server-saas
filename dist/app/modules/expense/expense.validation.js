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
exports.updateExpenseCategorySchema = exports.createExpenseCategorySchema = exports.updateExpenseSchema = exports.createExpenseSchema = void 0;
const z = __importStar(require("zod"));
exports.createExpenseSchema = z.object({
    date: z
        .string({ message: 'Please provide a date' })
        .transform((val) => new Date(val))
        .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: 'Date must be a valid date'
    }),
    reference: z
        .string({
        invalid_type_error: 'Reference must be a string',
        required_error: 'Please provide a reference'
    })
        .min(1),
    category: z
        .string({
        invalid_type_error: 'Category must be a string',
        required_error: 'Please provide a category'
    })
        .refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' }),
    amount: z.preprocess((value) => parseFloat(value), z.number().positive()),
    note: z.string().min(1).optional()
});
// Schema for updating an existing expense
exports.updateExpenseSchema = z.object({
    date: z
        .string({ message: 'Please provide a date' })
        .transform((val) => new Date(val))
        .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: 'Date must be a valid date'
    }),
    reference: z
        .string({
        invalid_type_error: 'Reference must be a string',
        required_error: 'Please provide a reference'
    })
        .min(1)
        .optional(),
    category: z
        .string()
        .refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' })
        .optional(),
    amount: z.preprocess((value) => (value ? parseFloat(value) : undefined), z.number().positive().optional()),
    note: z.string().min(1).optional()
});
exports.createExpenseCategorySchema = z.object({
    name: z
        .string({
        invalid_type_error: 'Name must be a string',
        required_error: "Please provide the category's name"
    })
        .min(1, 'Name is required'),
    code: z
        .string({
        invalid_type_error: 'Code must be a string',
        required_error: "Please provide the category's code"
    })
        .min(1, 'Code is required'),
    expenses: z
        .array(z.string().refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' }))
        .optional()
});
// Schema for updating an existing expense category
exports.updateExpenseCategorySchema = z.object({
    name: z
        .string({
        invalid_type_error: 'Name must be a string'
    })
        .min(1, 'Name is required')
        .optional(),
    code: z
        .string({
        invalid_type_error: 'Code must be a string'
    })
        .min(1, 'Code is required')
        .optional(),
    expenses: z
        .array(z.string().refine((value) => /^[a-fA-F0-9]{24}$/.test(value), { message: 'Invalid ObjectId' }))
        .optional()
});
