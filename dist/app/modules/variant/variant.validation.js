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
exports.updateVariantSchema = exports.createVariantSchema = void 0;
const z = __importStar(require("zod"));
exports.createVariantSchema = z.object({
    name: z.string({
        required_error: 'You must provide a variant name',
        invalid_type_error: 'Variant name must be a string'
    }),
    items: z
        .array(z.object({
        name: z.string({
            required_error: 'You must provide a variant item name',
            invalid_type_error: 'Variant item name must be a string'
        }),
        value: z.string({
            required_error: 'You must provide a variant item value',
            invalid_type_error: 'Variant item value must be a string'
        })
    }), {
        required_error: 'You must provide at least one variant item'
    })
        .min(1, 'You must provide at least one variant item')
});
exports.updateVariantSchema = z.object({
    name: z
        .string({
        required_error: 'You must provide a variant name',
        invalid_type_error: 'Variant name must be a string'
    })
        .optional(),
    items: z
        .array(z.object({
        name: z.string({
            required_error: 'You must provide a variant item name',
            invalid_type_error: 'Variant item name must be a string'
        }),
        value: z.string({
            required_error: 'You must provide a variant item value',
            invalid_type_error: 'Variant item value must be a string'
        })
    }))
        .min(1, 'You must provide at least one variant item')
        .optional()
});
