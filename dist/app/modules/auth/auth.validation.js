"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLoginSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginUserSchema = exports.emailVerifySchema = exports.userRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.userRegistrationSchema = zod_1.z.object({
    firstName: zod_1.z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    }),
    lastName: zod_1.z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    }),
    email: zod_1.z
        .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string'
    })
        .email({
        message: 'Please enter a valid email address'
    }),
    password: zod_1.z
        .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string'
    })
        .min(6, { message: 'Password must be at least 6 characters long' })
});
exports.emailVerifySchema = zod_1.z.object({
    token: zod_1.z.string({
        required_error: 'Please provide a token to verify your account',
        invalid_type_error: 'Token must be a string'
    }),
    code: zod_1.z.string({
        required_error: 'Please provide a code to verify your account',
        invalid_type_error: 'Code must be a string'
    })
});
exports.loginUserSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: 'Please enter your email address',
        invalid_type_error: 'Email must be a string'
    })
        .email({
        message: 'Please enter a valid email address'
    }),
    password: zod_1.z
        .string({
        required_error: 'Please enter your password',
        invalid_type_error: 'Password must be a string'
    })
        .min(6, { message: 'Password must be at least 6 characters long' })
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: 'Please enter your email address',
        invalid_type_error: 'Email must be a string'
    })
        .email({
        message: 'Please enter a valid email address'
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z
        .string({
        required_error: 'Please enter your new password',
        invalid_type_error: 'Password must be a string'
    })
        .min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: zod_1.z.string({
        required_error: 'Please confirm your new password',
        invalid_type_error: 'Confirm password must be a string'
    })
});
exports.googleLoginSchema = zod_1.z.object({});
