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
exports.updateTaxSchema = exports.createTaxSchema = void 0;
const z = __importStar(require("zod"));
exports.createTaxSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'Tax name must be at least 3 characters long' })
        .max(50, { message: 'Tax name cannot exceed 50 characters' })
        .trim(),
    code: z
        .string()
        .min(2, { message: 'Tax code must be at least 2 characters long' })
        .max(10, { message: 'Tax code cannot exceed 10 characters' })
        .trim(),
    rate: z.number().min(0, { message: 'Tax rate cannot be negative' }),
    type: z.enum(['Fixed', 'Percentage'], {
        errorMap: () => ({ message: 'Tax type must be either Fixed or Percentage' })
    })
});
exports.updateTaxSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'Tax name must be at least 3 characters long' })
        .max(50, { message: 'Tax name cannot exceed 50 characters' })
        .trim()
        .optional(),
    code: z
        .string()
        .min(2, { message: 'Tax code must be at least 2 characters long' })
        .max(10, { message: 'Tax code cannot exceed 10 characters' })
        .trim()
        .optional(),
    rate: z.number().min(0, { message: 'Tax rate cannot be negative' }).optional(),
    type: z
        .enum(['Fixed', 'Percentage'], {
        errorMap: () => ({ message: 'Tax type must be either Fixed or Percentage' })
    })
        .optional()
});
