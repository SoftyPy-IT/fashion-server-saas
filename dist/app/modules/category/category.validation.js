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
exports.updateMainCategoryZodSchema = exports.updateSubCategoryZodSchema = exports.updateCategoryZodSchema = exports.MainCategoryValidation = exports.CategoryValidation = exports.SubCategoryValidation = void 0;
const z = __importStar(require("zod"));
const SubCategorySchema = z.object({
    name: z.string(),
    category: z.string().optional(),
    serial: z.number().optional()
});
const CategorySchema = z.object({
    name: z.string(),
    image: z.string().optional()
});
const MainCategorySchema = z.object({
    name: z.string(),
    image: z
        .string({
        required_error: 'Please provide an image'
    })
        .min(1, { message: 'Please provide an image' })
        .optional()
});
exports.SubCategoryValidation = SubCategorySchema;
exports.CategoryValidation = CategorySchema;
exports.MainCategoryValidation = MainCategorySchema;
exports.updateCategoryZodSchema = CategorySchema.partial().optional();
exports.updateSubCategoryZodSchema = SubCategorySchema.partial().optional();
exports.updateMainCategoryZodSchema = MainCategorySchema.partial().optional();
