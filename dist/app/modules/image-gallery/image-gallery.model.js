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
exports.FolderModel = exports.ImageGalleryModel = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// ImageGallery Schema
const ImageGallerySchema = new mongoose_1.Schema({
    public_id: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    thumbnail_url: { type: String },
    folder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Folder', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date }
});
ImageGallerySchema.statics.isImageExists = function (public_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield this.countDocuments({ public_id });
        return count > 0;
    });
};
// Folder Schema
const FolderSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    images: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ImageGallery' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    parentFolder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Folder' },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
    type: { type: String, enum: ['image', 'product'], default: 'image' },
    deletedAt: { type: Date }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
FolderSchema.statics.createFolder = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if folder already exists
        const folderExists = yield this.findOne({ name });
        if (folderExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Folder already exists');
        }
        const folder = new this({ name });
        yield folder.save();
        return folder;
    });
};
FolderSchema.statics.deleteFolder = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.findOneAndUpdate({ name }, { deletedAt: new Date() });
    });
};
FolderSchema.virtual('totalImages').get(function () {
    return this.images.length;
});
FolderSchema.virtual('totalProducts').get(function () {
    return this.products.length || 0;
});
const ImageGalleryModel = (0, mongoose_1.model)('ImageGallery', ImageGallerySchema);
exports.ImageGalleryModel = ImageGalleryModel;
const FolderModel = (0, mongoose_1.model)('Folder', FolderSchema);
exports.FolderModel = FolderModel;
