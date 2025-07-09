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
exports.updateProductSchema = exports.createProductSchema = void 0;
const z = __importStar(require("zod"));
const imageSchema = z
    .string({
    required_error: 'Please provide an image ',
    invalid_type_error: 'Please provide a valid image '
})
    .min(1, { message: 'Image URL is required' });
const faqSchema = z.object({
    question: z.string().min(1, { message: 'FAQ question is required' }),
    answer: z.string().min(1, { message: 'FAQ answer is required' })
});
const variantSchema = z.object({
    name: z.string().optional(),
    values: z
        .array(z.object({
        name: z.string().min(1, { message: 'Variant value name is required' }),
        value: z.string().min(1, { message: 'Variant value is required' })
    }))
        .optional()
});
exports.createProductSchema = z.object({
    name: z
        .string({
        required_error: 'The product must have a name',
        invalid_type_error: 'Product name must be a string'
    })
        .min(1, { message: 'Product name is required' }),
    code: z
        .string({
        required_error: 'The product must have a code',
        invalid_type_error: 'Product code must be a string'
    })
        .min(1, { message: 'Product code is required' }),
    brand: z
        .string({
        required_error: 'Product brand is required',
        invalid_type_error: 'Product brand must be a string'
    })
        .optional()
        .nullable(),
    mainCategory: z.string({
        required_error: 'Product main category is required',
        invalid_type_error: 'Product main category must be a string'
    }),
    category: z
        .string({
        required_error: 'Product category is required',
        invalid_type_error: 'Product category must be a string'
    })
        .min(1, { message: 'Product category is required' }),
    subCategory: z.string().optional(),
    defaultSaleUnit: z.string().optional(),
    defaultPurchaseUnit: z.string().optional(),
    productCost: z
        .number({
        required_error: 'Product cost is required',
        invalid_type_error: 'Product cost must be a number'
    })
        .min(0, { message: 'Product cost must be greater than or equal to 0' }),
    price: z
        .number({
        required_error: 'Product price is required',
        invalid_type_error: 'Product price must be a number'
    })
        .min(0, { message: 'Product price must be greater than or equal to 0' }),
    description: z
        .string({
        required_error: 'Product description is required',
        invalid_type_error: 'Product description must be a string'
    })
        .min(1, { message: 'Product description is required' }),
    short_description: z
        .string({
        required_error: 'Product short description is required',
        invalid_type_error: 'Product short description must be a string'
    })
        .min(1, { message: 'Product short description is required' })
        .max(255, { message: 'Product short description must be less than 255 characters' }),
    thumbnail: z.string({
        required_error: 'The product must have a thumbnail',
        invalid_type_error: 'Product thumbnail must be a string'
    }),
    images: z.array(imageSchema, {
        required_error: 'The product must have at least one image',
        invalid_type_error: 'Product images must be an array of objects with url and public_id properties'
    }),
    supplier: z.string().optional(),
    discount_price: z
        .number({
        invalid_type_error: 'Product discount price must be a number'
    })
        .min(0, { message: 'Discount price must be greater than or equal to 0' })
        .optional(),
    tags: z
        .array(z.string({
        required_error: 'Product tag is required',
        invalid_type_error: 'Product tag must be a string'
    }))
        .optional(),
    stock: z
        .number({
        invalid_type_error: 'Product stock must be a number'
    })
        .optional()
        .default(1),
    is_stockout: z
        .boolean({
        invalid_type_error: 'Product stockout status must be a boolean'
    })
        .optional()
        .default(false),
    quantity: z
        .number({
        invalid_type_error: 'Product quantity must be a number'
    })
        .optional()
        .default(1),
    is_available: z
        .boolean({
        invalid_type_error: 'Product availability must be a boolean'
    })
        .optional()
        .default(true),
    is_featured: z
        .boolean({
        invalid_type_error: 'Product featured status must be a boolean'
    })
        .optional()
        .default(false),
    is_active: z
        .boolean({
        invalid_type_error: 'Product active status must be a boolean'
    })
        .optional()
        .default(true),
    total_sale: z
        .number({
        invalid_type_error: 'Product total sale must be a number'
    })
        .min(0, { message: 'Product total sale must be greater than or equal to 0' })
        .optional()
        .default(0),
    rating: z
        .number({
        invalid_type_error: 'Product rating must be a number'
    })
        .min(0, { message: 'Product rating must be greater than or equal to 0' })
        .max(5, { message: 'Product rating must be less than or equal to 5' })
        .optional()
        .default(0),
    faq: z.array(faqSchema).optional(),
    variants: z.array(variantSchema).optional(),
    hasVariants: z
        .boolean({
        invalid_type_error: 'Product hasVariants status must be a boolean'
    })
        .optional()
        .default(false),
    size_chart: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.array(z.string()).optional(),
    deletedAt: z.date().optional(),
    isDeleted: z.boolean().optional()
});
exports.updateProductSchema = exports.createProductSchema.partial().extend({
    code: z.string().min(1, { message: 'Product code is required' }).optional(),
    slug: z.string().min(1, { message: 'Product slug is required' }).optional(),
    brand: z.string().min(1, { message: 'Product brand is required' }).optional(),
    mainCategory: z.string().min(1, { message: 'Product category is required' }).optional(),
    category: z.string().min(1, { message: 'Product category is required' }).optional(),
    subCategory: z.string().optional(),
    productUnit: z.string().min(1, { message: 'Product unit is required' }).optional(),
    productTax: z.string().optional()
});
