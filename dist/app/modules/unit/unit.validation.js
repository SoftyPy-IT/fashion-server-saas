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
exports.updateUnitSchema = exports.createUnitSchema = void 0;
const z = __importStar(require("zod"));
exports.createUnitSchema = z.object({
    unit_code: z.string({
        required_error: 'Unit must have a unit code',
        invalid_type_error: 'Unit code must be a string'
    }),
    name: z.string({
        required_error: 'Unit must have a name',
        invalid_type_error: 'Unit name must be a string'
    }),
    base_unit: z
        .string({
        invalid_type_error: 'Base unit must be a string'
    })
        .nullable()
        .optional(),
    operator: z
        .enum(['*', '/', '+', '-'], {
        errorMap: () => ({ message: 'Operator must be one of: *, /, +, -' })
    })
        .nullable()
        .optional(),
    operation_value: z
        .number({
        invalid_type_error: 'Operation value must be a number'
    })
        .nullable()
        .optional()
});
exports.updateUnitSchema = z.object({
    unit_code: z
        .string({
        invalid_type_error: 'Unit code must be a string'
    })
        .optional(),
    name: z
        .string({
        invalid_type_error: 'Unit name must be a string'
    })
        .optional()
});
