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
exports.updateSectionSchema = exports.createSectionSchema = void 0;
const z = __importStar(require("zod"));
const imageSchema = z.object({
    desktop: z
        .array(z.object({
        url: z.string({
            required_error: 'Desktop image URL must be a string'
        }),
        link: z.string({
            required_error: 'Desktop image link must be a string'
        })
    }))
        .optional(),
    mobile: z
        .array(z.object({
        url: z.string({
            required_error: 'Mobile image URL must be a string'
        }),
        link: z.string({
            required_error: 'Mobile image link must be a string'
        })
    }))
        .optional()
});
exports.createSectionSchema = z.object({
    title: z
        .string({
        required_error: 'Section must have a title',
        invalid_type_error: 'Section title must be a string'
    })
        .optional(),
    subTitle: z
        .string({
        required_error: 'Section must have a subTitle',
        invalid_type_error: 'Section subTitle must be a string'
    })
        .optional(),
    description: z
        .string({
        invalid_type_error: 'Section description must be a string'
    })
        .optional(),
    image: z
        .string({
        invalid_type_error: 'Section imageUrl must be a string'
    })
        .nullable()
        .optional(),
    images: imageSchema.optional(),
    products: z
        .array(z.string({
        required_error: 'Section must have products',
        invalid_type_error: 'Section products must be an array of strings'
    }))
        .min(1, 'Section must have at least one product')
        .optional(),
    style: z.enum(['grid', 'carousel']).default('carousel').optional(),
    row: z.number().default(4).optional()
});
exports.updateSectionSchema = z.object({
    title: z.string().optional(),
    subTitle: z.string().optional(),
    description: z.string().optional(),
    image: z.string().nullable().optional(),
    images: imageSchema.optional(),
    products: z.array(z.string()).optional(),
    style: z.enum(['grid', 'carousel']).optional(),
    row: z.number().optional()
});
