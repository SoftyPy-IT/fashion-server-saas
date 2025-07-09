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
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {
        type: String,
        required: false
    },
    password: { type: String, required: true, select: 0 },
    avatar: {
        public_id: String,
        url: String
    },
    dateOfBirth: { type: Date },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: true,
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        required: true,
        default: 'active'
    },
    isVerified: { type: Boolean, default: false },
    passwordChangedAt: {
        type: Date
    },
    address: {
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    hasShippingAddress: { type: Boolean, default: false },
    shippingAddress: {
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    orders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' }],
    wishlist: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
    paymentHistory: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' }],
    reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Review' }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
        }
    }
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const user = this;
        user.password = yield bcrypt_1.default.hash(user.password, 10);
        next();
    });
});
userSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});
userSchema.statics.comparePassword = function (enteredPassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(enteredPassword, userPassword);
    });
};
userSchema.statics.isUserExist = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findOne({ email });
        return user ? true : false;
    });
};
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
