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
const storefront_model_1 = __importDefault(require("../../modules/storefront/storefront.model"));
const storefront_1 = require("../__mock__/storefront");
const checkCollectionEmpty_1 = require("../../utils/checkCollectionEmpty");
const seedStorefront = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCollectionEmpty = yield (0, checkCollectionEmpty_1.checkCollectionEmpty)(storefront_model_1.default);
        if (isCollectionEmpty) {
            yield storefront_model_1.default.create(storefront_1.storefrontData);
            console.log('Storefront seeded successfully');
        }
        else {
            console.log('Storefront collection already has data. Skipping seeding.');
        }
    }
    catch (error) {
        throw new Error(`Failed to seed storefront: ${error.message}`);
    }
});
exports.default = seedStorefront;
