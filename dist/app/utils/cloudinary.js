"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryConfig = exports.upload = exports.deleteAttachment = exports.saveAttachment = exports.deleteImageFromCloudinary = exports.sendImageToCloudinary = void 0;
/* eslint-disable no-undef */
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.default.CLOUDINARY_CLOUD_KEY,
    api_secret: config_1.default.CLOUDINARY_CLOUD_SECRET
});
const deleteFile = (path) => {
    fs_1.default.unlink(path, (err) => {
        if (err) {
            console.error(`Failed to delete file at ${path}:`, err);
        }
        else {
            console.log('File is deleted.');
        }
    });
};
const sendImageToCloudinary = (imageName, path, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(path, {
            public_id: imageName.trim(),
            folder: `softypy/${folder}`
        });
        deleteFile(path);
        return result;
    }
    catch (error) {
        deleteFile(path);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to upload image to Cloudinary');
    }
});
exports.sendImageToCloudinary = sendImageToCloudinary;
const deleteImageFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to delete image from Cloudinary');
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
const saveAttachment = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const path = file.path;
    const uniqueFilename = new Date().toISOString();
    try {
        const result = yield cloudinary_1.v2.uploader.upload(path, {
            public_id: uniqueFilename,
            folder: 'softypy/attachments'
        });
        deleteFile(path);
        return result;
    }
    catch (error) {
        deleteFile(path);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to upload attachment to Cloudinary');
    }
});
exports.saveAttachment = saveAttachment;
const deleteAttachment = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to delete attachment from Cloudinary');
    }
});
exports.deleteAttachment = deleteAttachment;
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 2, // 3MB
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|jpeg|png|webp|gif/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Only images are allowed. Supported formats are jpeg, jpg, png, webp and gif'));
    }
});
exports.cloudinaryConfig = cloudinary_1.v2;
