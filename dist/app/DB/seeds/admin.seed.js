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
const user_model_1 = __importDefault(require("../../modules/user/user.model"));
const checkCollectionEmpty_1 = require("../../utils/checkCollectionEmpty");
const admin = {
    firstName: 'Softypy',
    lastName: 'IT',
    email: 'softypy@gmail.com',
    password: '12345678',
    role: 'admin',
    isVerified: true,
    isDeleted: false
};
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCollectionEmpty = yield (0, checkCollectionEmpty_1.checkCollectionEmpty)(user_model_1.default);
        if (isCollectionEmpty) {
            yield user_model_1.default.create(admin);
            console.log('Admin seeded successfully');
        }
        else {
            console.log('Admin collection already has data. Skipping seeding.');
        }
    }
    catch (error) {
        throw new Error(`Failed to seed admin: ${error.message}`);
    }
});
exports.default = seedAdmin;
