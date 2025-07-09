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
exports.updateOffersSchema = exports.createOffersSchema = void 0;
const z = __importStar(require("zod"));
exports.createOffersSchema = z.object({
    title: z
        .string({
        required_error: 'Please provide an offer title',
        invalid_type_error: 'Title should be a string'
    })
        .min(3, { message: "Title can't be less than 3 characters" })
        .max(50, { message: "Title can't be more than 50 characters" }),
    subTitle: z
        .string({
        required_error: 'Please provide an offer subTitle',
        invalid_type_error: 'SubTitle should be a string'
    })
        .min(3, { message: "SubTitle can't be less than 3 characters" })
        .max(50, { message: "SubTitle can't be more than 50 characters" }),
    startDate: z.string({
        required_error: 'Please provide an offer startDate',
        invalid_type_error: 'startDate should be a string'
    }),
    endDate: z.string({
        required_error: 'Please provide an offer endDate',
        invalid_type_error: 'endDate should be a string'
    }),
    products: z
        .array(z.string({
        required_error: 'Please provide offer products',
        invalid_type_error: 'products should be a string'
    }), {
        required_error: 'Please provide offer products'
    })
        .min(1, { message: 'Please provide at least one product' })
});
exports.updateOffersSchema = z.object({
    title: z
        .string({
        invalid_type_error: 'Title should be a string'
    })
        .min(3, { message: "Title can't be less than 3 characters" })
        .max(20, { message: "Title can't be more than 20 characters" })
        .optional(),
    subTitle: z
        .string({
        invalid_type_error: 'SubTitle should be a string'
    })
        .min(3, { message: "SubTitle can't be less than 3 characters" })
        .max(50, { message: "SubTitle can't be more than 50 characters" })
        .optional(),
    startDate: z
        .string({
        invalid_type_error: 'startDate should be a string'
    })
        .optional(),
    endDate: z
        .string({
        invalid_type_error: 'endDate should be a string'
    })
        .optional(),
    products: z
        .array(z.string({
        invalid_type_error: 'products should be a string'
    }))
        .optional(),
    productId: z.string().optional(),
    action: z.string().optional()
});
