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
exports.createFolderSchema = exports.deleteImageFromGallerySchema = exports.uploadImageToGallerySchema = void 0;
const zod = __importStar(require("zod"));
exports.uploadImageToGallerySchema = zod.object({
    folder: zod.string({
        required_error: 'Folder is required',
        invalid_type_error: 'Folder must be a string'
    }),
    height: zod
        .number({
        required_error: 'Height is required',
        invalid_type_error: 'Height must be a number'
    })
        .optional(),
    width: zod
        .number({
        required_error: 'Width is required',
        invalid_type_error: 'Width must be a number'
    })
        .optional()
});
exports.deleteImageFromGallerySchema = zod.object({
    id: zod.string({
        required_error: 'Image ID is required',
        invalid_type_error: 'Image ID must be a string'
    }),
    public_id: zod.string({
        required_error: 'Public ID is required',
        invalid_type_error: 'Public ID must be a string'
    })
});
exports.createFolderSchema = zod.object({
    name: zod.string({
        required_error: 'Folder name is required',
        invalid_type_error: 'Folder name must be a string'
    })
});
