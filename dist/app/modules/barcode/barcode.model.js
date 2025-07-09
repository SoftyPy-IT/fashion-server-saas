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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const barcodeSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    barcode: {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    },
    product_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});
barcodeSchema.statics.isBarcodeExist = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        return !!(yield this.findOne({ name }));
    });
};
const Barcode = (0, mongoose_1.model)('Barcode', barcodeSchema);
exports.default = Barcode;
