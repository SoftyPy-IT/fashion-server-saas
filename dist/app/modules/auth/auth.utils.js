"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = exports.verifyEmailVerificationToken = exports.createEmailVerificationToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createEmailVerificationToken = (payload) => {
    try {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        // create token
        const token = jsonwebtoken_1.default.sign({ code, user: payload }, config_1.default.EMAILACTIVATION_SECRET, {
            expiresIn: '10m'
        });
        return {
            code,
            token
        };
    }
    catch (error) {
        throw new AppError_1.default(500, error.message || 'Something went wrong');
    }
};
exports.createEmailVerificationToken = createEmailVerificationToken;
const verifyEmailVerificationToken = (token) => {
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.default.EMAILACTIVATION_SECRET);
        return decodedToken;
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyEmailVerificationToken = verifyEmailVerificationToken;
const createToken = (payload, secret, expiresIn) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn: `${expiresIn}`
    });
    return token;
};
exports.createToken = createToken;
const verifyToken = (token, secret) => {
    return jsonwebtoken_1.default.verify(token.toString(), secret.toString());
};
exports.verifyToken = verifyToken;
