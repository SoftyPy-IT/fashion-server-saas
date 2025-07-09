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
exports.updateBrandSchema = exports.createBrandSchema = void 0;
const z = __importStar(require("zod"));
exports.createBrandSchema = z.object({
    name: z
        .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    })
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters'),
    image: z
        .string({
        required_error: 'Image is required',
        invalid_type_error: 'Image must be a string'
    })
        .refine((value) => value.startsWith('http'), {
        message: 'Image must be a valid URL'
    }),
    description: z
        .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string'
    })
        .min(10, 'Description must be at least 10 characters')
        .max(255, 'Description must be at most 255 characters')
});
exports.updateBrandSchema = z.object({
    name: z
        .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    })
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters')
        .optional(),
    image: z
        .string({
        required_error: 'Image is required',
        invalid_type_error: 'Image must be a string'
    })
        .refine((value) => value.startsWith('http'), {
        message: 'Image must be a valid URL'
    })
        .optional(),
    description: z
        .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string'
    })
        .min(10, 'Description must be at least 10 characters')
        .max(255, 'Description must be at most 255 characters')
        .optional()
});
