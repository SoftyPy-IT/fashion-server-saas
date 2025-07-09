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
const variant_model_1 = __importDefault(require("../../modules/variant/variant.model"));
const variants_1 = require("../__mock__/variants");
const checkCollectionEmpty_1 = require("../../utils/checkCollectionEmpty");
const seedVariants = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCollectionEmpty = yield (0, checkCollectionEmpty_1.checkCollectionEmpty)(variant_model_1.default);
        if (isCollectionEmpty) {
            yield variant_model_1.default.insertMany(variants_1.variants);
            console.log('Variants seeded successfully');
        }
        else {
            console.log('Variants collection already has data. Skipping seeding.');
        }
    }
    catch (error) {
        console.error('Error seeding variants:', error);
        throw new Error(`Failed to seed variants: ${error.message}`);
    }
});
exports.default = seedVariants;
