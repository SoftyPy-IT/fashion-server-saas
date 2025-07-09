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
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const auth_utils_1 = require("../modules/auth/auth.utils");
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please login to continue');
        }
        const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.JWT_SECRET);
        const { userId, role } = decoded;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'This user does not exist');
        }
        const userStatus = user === null || user === void 0 ? void 0 : user.status;
        if (userStatus === 'inactive' || userStatus === 'blocked') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This is user is inactive or blocked');
        }
        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You do not have permission to perform this action');
        }
        req.user = decoded;
        next();
    }));
};
exports.default = auth;
