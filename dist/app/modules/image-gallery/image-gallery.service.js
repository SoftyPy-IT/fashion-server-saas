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
exports.imageGalleryService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const softypy_media_service_1 = require("softypy-media-service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
(0, softypy_media_service_1.configureMediaService)({
    baseUrl: 'https://media.fashion.com.bd/api/v1/media',
    apiKey: '27630336ccbaa1c735968a35471c6f4a5df7810f536314140ceb7d1eeec0b77b'
});
const mediaService = (0, softypy_media_service_1.getMediaService)();
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const helper_1 = require("../../utils/helper");
const image_gallery_model_1 = require("./image-gallery.model");
const getAllImages = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const galleryQuery = new QueryBuilder_1.default(image_gallery_model_1.ImageGalleryModel.find(), query)
            .filter()
            .sort()
            .paginate();
        const meta = yield galleryQuery.countTotal();
        const result = yield galleryQuery.queryModel;
        return { result, meta };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
const getImagesByFolder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { folder } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    try {
        const folderExist = yield image_gallery_model_1.FolderModel.findOne({ _id: folder });
        if (!folderExist) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        const totalImages = yield image_gallery_model_1.ImageGalleryModel.countDocuments({
            folder: folderExist._id
        });
        const images = yield image_gallery_model_1.ImageGalleryModel.find({
            folder: folderExist._id
        })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        return {
            images,
            folder: folderExist.name,
            meta: {
                total: totalImages,
                page,
                limit,
                totalPages: Math.ceil(totalImages / limit)
            }
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
// Function to create and upload images
const createImage = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const { folder } = req.body;
        if (!files || Object.keys(files).length === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please upload an image');
        }
        if (!folder) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide a folder name');
        }
        // Check if folder exists, otherwise create it
        const folderDoc = yield image_gallery_model_1.FolderModel.findOne({ _id: folder });
        if (!folderDoc) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        const uploadedImages = [];
        for (const file of files) {
            const image = new File([file.buffer], file.originalname, { type: file.mimetype });
            const validationError = (0, helper_1.imageValidator)(image.size, image.type);
            if (validationError) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, validationError);
            }
            const { thumbnailUrl, url, publicId } = (yield mediaService.uploadFile(image));
            uploadedImages.push({
                url: url,
                thumbnail_url: thumbnailUrl,
                public_id: publicId,
                folder: folderDoc._id
            });
        }
        // Insert all images at once to avoid duplicates
        if (uploadedImages.length > 0) {
            const insertedImages = yield image_gallery_model_1.ImageGalleryModel.insertMany(uploadedImages);
            yield image_gallery_model_1.FolderModel.findByIdAndUpdate(folderDoc._id, {
                $addToSet: {
                    images: { $each: insertedImages.map((image) => image._id) }
                }
            });
        }
        return 'Images uploaded successfully';
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || "Couldn't upload images");
    }
});
// Function to delete an image
const deleteImage = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, public_id } = req.body;
        const image = yield image_gallery_model_1.ImageGalleryModel.findById(id);
        if (!image) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
        }
        // Delete image from Cloudinary
        yield mediaService.deleteFile(public_id);
        // Delete image from database
        yield image_gallery_model_1.ImageGalleryModel.findByIdAndDelete(id);
        return 'Image deleted successfully';
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || 'Could not delete image');
    }
});
const getFolders = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchableFields = ['name'];
        const query = Object.assign(Object.assign({}, req.query), { type: req.query.type || 'image' || null });
        const folderQuery = new QueryBuilder_1.default(image_gallery_model_1.FolderModel.find(), query)
            .search(searchableFields)
            .filter()
            .sort()
            .paginate();
        const meta = yield folderQuery.countTotal();
        const result = yield folderQuery.queryModel;
        return {
            meta,
            result
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || 'Could not get folders');
    }
});
const getFolderById = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const folder = yield image_gallery_model_1.FolderModel.findById(id);
        if (!folder) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        return folder;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || 'Could not get folder');
    }
});
const updateFolder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const folder = yield image_gallery_model_1.FolderModel.findById(id);
        if (!folder) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        yield image_gallery_model_1.FolderModel.findByIdAndUpdate(id, { name });
        return 'Folder updated successfully';
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || 'Could not update folder');
    }
});
// Function to create a folder
const createFolder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type } = req.body;
        if (!name) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide a folder name');
        }
        const folder = yield image_gallery_model_1.FolderModel.create({ name, type: type || 'image' });
        return folder;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || 'Could not create folder');
    }
});
// Function to delete a folder
const deleteFolder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // check if folder has images if yes, then show error message else delete folder
        const folder = yield image_gallery_model_1.FolderModel.findById(id);
        if (!folder) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Folder not found');
        }
        //  Check if folder has images in image model
        const images = yield image_gallery_model_1.ImageGalleryModel.find({ folder: id });
        if (images.length > 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Folder has images, please delete them first');
        }
        yield image_gallery_model_1.FolderModel.findByIdAndDelete(id);
        return 'Folder deleted successfully';
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message || 'Could not delete folder');
    }
});
exports.imageGalleryService = {
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
