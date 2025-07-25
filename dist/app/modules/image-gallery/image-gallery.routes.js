"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageGalleryRoutes = void 0;
const express_1 = require("express");
const image_gallery_controller_1 = require("./image-gallery.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const cloudinary_1 = require("../../utils/cloudinary");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const image_gallery_validation_1 = require("./image-gallery.validation");
const router = (0, express_1.Router)();
router.get('/all', (0, auth_1.default)('admin'), image_gallery_controller_1.imageGalleryController.getAllImages);
router.get('/folder/:folder', (0, auth_1.default)('admin'), image_gallery_controller_1.imageGalleryController.getImagesByFolder);
router.post('/upload', (0, auth_1.default)('admin'), cloudinary_1.upload.array('images'), (0, validateRequest_1.default)(image_gallery_validation_1.uploadImageToGallerySchema), image_gallery_controller_1.imageGalleryController.createImage);
router.post('/delete', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(image_gallery_validation_1.deleteImageFromGallerySchema), image_gallery_controller_1.imageGalleryController.deleteImage);
router.get('/folders', (0, auth_1.default)('admin'), image_gallery_controller_1.imageGalleryController.getFolders);
router.get('/folders/:id', (0, auth_1.default)('admin'), image_gallery_controller_1.imageGalleryController.getFolderById);
router.post('/folder', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(image_gallery_validation_1.createFolderSchema), image_gallery_controller_1.imageGalleryController.createFolder);
router.put('/folder/update/:id', (0, auth_1.default)('admin'), image_gallery_controller_1.imageGalleryController.updateFolder);
router.delete('/folder/:id', (0, auth_1.default)('admin'), image_gallery_controller_1.imageGalleryController.deleteFolder);
exports.imageGalleryRoutes = router;
