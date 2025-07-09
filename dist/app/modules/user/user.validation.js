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
exports.updateUserByAdminSchema = exports.createUserByAdminSchema = exports.userRoleChangeValidationSchema = exports.userChangeStatusValidationSchema = exports.updateProfileSchema = exports.changePasswordSchema = void 0;
const z = __importStar(require("zod"));
const phoneRegex = new RegExp(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/);
exports.changePasswordSchema = z.object({
    oldPassword: z.string({
        required_error: 'Please enter your old password',
        invalid_type_error: 'Old password must be a string'
    }),
    newPassword: z
        .string({
        required_error: 'Please enter your new password',
        invalid_type_error: 'New password must be a string'
    })
        .min(6, { message: 'Password must be at least 6 characters long' })
});
exports.updateProfileSchema = z.object({
    firstName: z
        .string({
        required_error: 'Please enter your first name',
        invalid_type_error: 'First name must be a string'
    })
        .optional(),
    lastName: z
        .string({
        required_error: 'Please enter your last name',
        invalid_type_error: 'Last name must be a string'
    })
        .optional(),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional(),
    dateOfBirth: z
        .string({
        required_error: 'Please enter your date of birth',
        invalid_type_error: 'Date of birth must be a string'
    })
        .optional(),
    address: z
        .object({
        address: z
            .string({
            required_error: 'Please enter your address',
            invalid_type_error: 'Address must be a string'
        })
            .optional(),
        city: z
            .string({
            required_error: 'Please enter your city',
            invalid_type_error: 'City must be a string'
        })
            .optional(),
        postalCode: z
            .string({
            required_error: 'Please enter your postal code',
            invalid_type_error: 'Postal code must be a string'
        })
            .optional(),
        country: z
            .string({
            required_error: 'Please enter your country',
            invalid_type_error: 'Country must be a string'
        })
            .optional()
    })
        .optional()
});
const UserStatus = ['active', 'inactive', 'banned'];
exports.userChangeStatusValidationSchema = z.object({
    status: z.enum([...UserStatus], {
        required_error: 'Please enter the status',
        invalid_type_error: 'Status must be a string'
    })
});
const UserRole = ['user', 'admin'];
exports.userRoleChangeValidationSchema = z.object({
    role: z.enum([...UserRole], {
        required_error: 'Please enter the role',
        invalid_type_error: 'Role must be a string'
    })
});
exports.createUserByAdminSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum([...UserRole], {
        required_error: 'Please enter the role',
        invalid_type_error: 'Role must be a string'
    }),
    firstName: z.string({
        required_error: 'Please enter first name',
        invalid_type_error: 'First name must be a string'
    }),
    lastName: z.string({
        required_error: 'Please enter last name',
        invalid_type_error: 'Last name must be a string'
    }),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z
        .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional()
    })
        .optional()
});
exports.updateUserByAdminSchema = z.object({
    email: z.string().email('Please enter a valid email address').optional(),
    firstName: z
        .string({
        required_error: 'Please enter first name',
        invalid_type_error: 'First name must be a string'
    })
        .optional(),
    lastName: z
        .string({
        required_error: 'Please enter last name',
        invalid_type_error: 'Last name must be a string'
    })
        .optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z
        .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional()
    })
        .optional()
});
