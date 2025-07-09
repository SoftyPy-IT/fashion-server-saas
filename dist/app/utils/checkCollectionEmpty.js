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
exports.checkCollectionEmpty = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const checkCollectionEmpty = (model) => __awaiter(void 0, void 0, void 0, function* () {
    const collectionName = model.collection.collectionName;
    const collections = yield mongoose_1.default.connection.db.listCollections().toArray();
    const collectionExists = collections.some((collection) => collection.name === collectionName);
    if (!collectionExists) {
        return true; // Collection does not exist, so it's considered empty
    }
    const documentCount = yield model.countDocuments();
    return documentCount === 0;
});
exports.checkCollectionEmpty = checkCollectionEmpty;
