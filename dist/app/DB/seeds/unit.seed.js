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
const unit_model_1 = __importDefault(require("../../modules/unit/unit.model"));
const checkCollectionEmpty_1 = require("../../utils/checkCollectionEmpty");
const unit_1 = __importDefault(require("../__mock__/unit"));
const seedUnitData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCollectionEmpty = yield (0, checkCollectionEmpty_1.checkCollectionEmpty)(unit_model_1.default);
        if (isCollectionEmpty) {
            console.log('Seeding units...');
            yield unit_model_1.default.create(unit_1.default);
            console.log('Unit seeding completed.');
        }
        else {
            console.log('Unit collection already has data. Skipping seeding.');
        }
    }
    catch (error) {
        console.error('Error seeding units:', error);
        throw new Error('Failed to seed units' + error.message);
    }
});
exports.default = seedUnitData;
