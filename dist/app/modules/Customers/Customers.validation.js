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
exports.updateCustomersSchema = exports.createCustomersSchema = void 0;
const z = __importStar(require("zod"));
exports.createCustomersSchema = z
    .object({
    company: z
        .string({
        required_error: 'Please enter the company name',
        invalid_type_error: 'Company name must be a string'
    })
        .min(1)
        .max(255),
    name: z
        .string({
        required_error: 'Please enter the supplier name',
        invalid_type_error: 'Supplier name must be a string'
    })
        .min(1)
        .max(255),
    vatNumber: z
        .string({
        invalid_type_error: 'VAT number must be a string'
    })
        .max(50)
        .optional(),
    gstNumber: z
        .string({
        invalid_type_error: 'GST number must be a string'
    })
        .max(50)
        .optional(),
    email: z
        .string({
        required_error: 'Please enter your email address',
        invalid_type_error: 'Email address must be a string'
    })
        .email({
        message: 'Please enter a valid email address'
    }),
    phone: z.string({
        required_error: 'Please enter your phone number',
        invalid_type_error: 'Phone number must be a string'
    }),
    address: z
        .string({
        required_error: 'Please enter the address',
        invalid_type_error: 'Address must be a string'
    })
        .min(1)
        .max(255),
    city: z
        .string({
        required_error: 'Please enter the city',
        invalid_type_error: 'City must be a string'
    })
        .min(1)
        .max(100),
    state: z
        .string({
        required_error: 'Please enter the state',
        invalid_type_error: 'State must be a string'
    })
        .max(100)
        .optional()
        .nullable(),
    postalCode: z
        .string({
        required_error: 'Please enter the postal code',
        invalid_type_error: 'Postal code must be a string'
    })
        .max(20)
        .optional()
        .nullable(),
    country: z
        .string({
        required_error: 'Please enter the country',
        invalid_type_error: 'Country must be a string'
    })
        .min(1)
        .max(100)
})
    .strict();
exports.updateCustomersSchema = z
    .object({
    company: z
        .string({
        invalid_type_error: 'Company name must be a string'
    })
        .min(1)
        .max(255)
        .optional(),
    name: z
        .string({
        invalid_type_error: 'Supplier name must be a string'
    })
        .min(1)
        .max(255)
        .optional(),
    vatNumber: z
        .string({
        invalid_type_error: 'VAT number must be a string'
    })
        .max(50)
        .optional(),
    gstNumber: z
        .string({
        invalid_type_error: 'GST number must be a string'
    })
        .max(50)
        .optional(),
    email: z
        .string({
        invalid_type_error: 'Email address must be a string'
    })
        .email({
        message: 'Please enter a valid email address'
    })
        .optional(),
    phone: z
        .string({
        invalid_type_error: 'Phone number must be a string'
    })
        .optional(),
    address: z
        .string({
        invalid_type_error: 'Address must be a string'
    })
        .min(1)
        .max(255)
        .optional(),
    city: z
        .string({
        invalid_type_error: 'City must be a string'
    })
        .min(1)
        .max(100)
        .optional(),
    state: z
        .string({
        invalid_type_error: 'State must be a string'
    })
        .max(100)
        .optional(),
    postalCode: z
        .string({
        invalid_type_error: 'Postal code must be a string'
    })
        .max(20)
        .optional(),
    country: z
        .string({
        invalid_type_error: 'Country must be a string'
    })
        .min(1)
        .max(100)
        .optional()
})
    .partial();
