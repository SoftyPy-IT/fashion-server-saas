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
const tax_model_1 = __importDefault(require("../../modules/tax/tax.model"));
const tax_1 = __importDefault(require("../__mock__/tax"));
const checkCollectionEmpty_1 = require("../../utils/checkCollectionEmpty");
const seedTaxRates = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCollectionEmpty = yield (0, checkCollectionEmpty_1.checkCollectionEmpty)(tax_model_1.default);
        if (isCollectionEmpty) {
            yield tax_model_1.default.insertMany(tax_1.default);
            console.log('Tax rates seeded successfully');
        }
        else {
            console.log('Tax collection already has data. Skipping seeding.');
        }
    }
    catch (error) {
        console.error('Error seeding tax rates:', error);
        throw new Error('Failed to seed tax rates' + error.message);
    }
});
exports.default = seedTaxRates;
