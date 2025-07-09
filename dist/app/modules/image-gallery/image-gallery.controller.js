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
exports.imageGalleryController = void 0;
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const image_gallery_service_1 = require("./image-gallery.service");
const getAllImages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.getAllImages(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Images retrieved successfully',
        data: result.result,
        meta: result.meta
    });
}));
const getImagesByFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.getImagesByFolder(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Images retrieved successfully',
        data: result
    });
}));
const createImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.createImage(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Image uploaded successfully',
        data: result
    });
}));
const deleteImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.deleteImage(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Image deleted successfully',
        data: result
    });
}));
// Function to create a folder
const createFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.createFolder(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Folder created successfully',
        data: result
    });
}));
// Function to get all folders
const getFolders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.getFolders(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Folders retrieved successfully',
        data: result.result,
        meta: result.meta
    });
}));
const getFolderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.getFolderById(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Folder retrieved successfully',
        data: result
    });
}));
const updateFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.updateFolder(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Folder updated successfully',
        data: result
    });
}));
// Function to delete a folder
const deleteFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield image_gallery_service_1.imageGalleryService.deleteFolder(req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Folder deleted successfully',
        data: result
    });
}));
exports.imageGalleryController = {
    getAllImages,
    getImagesByFolder,
    createImage,
    deleteImage,
    createFolder,
    deleteFolder,
    getFolders,
    updateFolder,
    getFolderById
};
