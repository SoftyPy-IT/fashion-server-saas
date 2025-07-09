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
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const EmailJob_1 = require("../../jobs/EmailJob");
const helper_1 = require("../../utils/helper");
const storefront_model_1 = __importDefault(require("../storefront/storefront.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const auth_utils_1 = require("./auth.utils");
const sendVerificationEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, firstName, lastName, password } = req.body;
        const payload = {
            firstName,
            lastName,
            email,
            password
        };
        const verificationCode = (0, auth_utils_1.createEmailVerificationToken)(payload);
        const appData = yield storefront_model_1.default.findOne({})
            .select('shopName description contact socialMedia logo')
            .lean();
        const emailData = {
            code: verificationCode.code,
            email: email,
            name: `${firstName} ${lastName}`,
            shopName: appData === null || appData === void 0 ? void 0 : appData.shopName,
            description: appData === null || appData === void 0 ? void 0 : appData.description,
            contact: appData === null || appData === void 0 ? void 0 : appData.contact,
            socialMedia: appData === null || appData === void 0 ? void 0 : appData.socialMedia,
            logo: appData === null || appData === void 0 ? void 0 : appData.logo,
            verificationCode: [
                verificationCode.code[0],
                verificationCode.code[1],
                verificationCode.code[2],
                verificationCode.code[3]
            ],
            url: req.protocol + '://' + req.get('host')
        };
        const html = yield (0, helper_1.renderEjs)('email.verification', emailData);
        yield EmailJob_1.emailQueue.add(EmailJob_1.emailQueueName, {
            to: email,
            subject: 'Verify your email',
            body: html
        });
        return {
            token: verificationCode.token
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
    }
});
const userRegistration = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const isUserExist = yield user_model_1.default.isUserExist(email);
        if (isUserExist) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This email is already used');
        }
        // verify email and save user to database
        const { token } = yield sendVerificationEmail(req);
        return {
            token
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
const verifyEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, code } = req.body;
        // verify token
        const decodedToken = (0, auth_utils_1.verifyEmailVerificationToken)(token);
        if (decodedToken.code !== code) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This is an invalid code, please try again');
        }
        const { firstName, lastName, email, password } = decodedToken.user;
        const isUserExist = yield user_model_1.default.isUserExist(email);
        if (isUserExist) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This email is already used');
        }
        const user = yield user_model_1.default.create({
            firstName,
            lastName,
            email,
            password,
            isVerified: true
        });
        // create token
        const jwtPayload = {
            userId: user._id,
            role: user.role
        };
        const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_SECRET, config_1.default.JWT_EXPIRES_IN);
        const refreshToekn = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_REFRESH_SECRET, config_1.default.JWT_REFRESH_EXPIRES_IN);
        const appData = yield storefront_model_1.default.findOne({})
            .select('shopName description contact socialMedia logo')
            .lean();
        const emailData = {
            email: email,
            name: `${firstName} ${lastName}`,
            shopName: appData === null || appData === void 0 ? void 0 : appData.shopName,
            description: appData === null || appData === void 0 ? void 0 : appData.description,
            contact: appData === null || appData === void 0 ? void 0 : appData.contact,
            socialMedia: appData === null || appData === void 0 ? void 0 : appData.socialMedia,
            logo: appData === null || appData === void 0 ? void 0 : appData.logo,
            url: req.protocol + '://' + req.get('host')
        };
        const html = yield (0, helper_1.renderEjs)('email.welcome', emailData);
        yield EmailJob_1.emailQueue.add(EmailJob_1.emailQueueName, {
            to: email,
            subject: 'Welcome to our platform',
            body: html
        });
        return {
            user: Object.assign(Object.assign({}, user.toJSON()), { password, token: accessToken }),
            accessToken,
            refreshToekn
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
const userLogin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const isUserExist = yield user_model_1.default.isUserExist(email);
        if (!isUserExist) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You entered an wrong email or password');
        }
        const user = yield user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You entered an wrong email or password');
        }
        const passwordMatch = yield user_model_1.default.comparePassword(password, user.password);
        if (!passwordMatch) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You entered an wrong email or password');
        }
        // create token
        const jwtPayload = {
            userId: user._id,
            role: user.role
        };
        const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_SECRET, config_1.default.JWT_EXPIRES_IN);
        const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_REFRESH_SECRET, config_1.default.JWT_REFRESH_EXPIRES_IN);
        return {
            user: Object.assign(Object.assign({}, user.toJSON()), { token: accessToken }),
            accessToken,
            refreshToken
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
const refreshToken = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please provide a refresh token');
        }
        const decoded = (0, auth_utils_1.verifyToken)(refreshToken, config_1.default.JWT_REFRESH_SECRET);
        if (!decoded) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid or expired token');
        }
        const { userId } = decoded;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found');
        }
        const userStatus = user === null || user === void 0 ? void 0 : user.status;
        if (userStatus === 'blocked' || userStatus === 'inactive') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked or inactive');
        }
        const jwtPayload = {
            userId: user._id,
            role: user.role
        };
        const newRefreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_REFRESH_SECRET, config_1.default.JWT_REFRESH_EXPIRES_IN);
        const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_SECRET, config_1.default.JWT_EXPIRES_IN);
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user
        };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
const forgetPasswordService = (req, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No user found with this email');
        }
        const userStatus = user === null || user === void 0 ? void 0 : user.status;
        if (userStatus === 'blocked' || userStatus === 'inactive') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This is user is blocked or inactive');
        }
        const jwtPayload = {
            userId: user.id,
            role: user.role
        };
        const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.JWT_SECRET, '10m');
        const appData = yield storefront_model_1.default.findOne({})
            .select('shopName description contact socialMedia logo')
            .lean();
        const emailData = {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            resetUILink: `${config_1.default.RESET_PASS_LINK}?id=${user.id}&token=${accessToken}`,
            supportEmail: config_1.default.SUPPORTEMAIl,
            shopName: appData === null || appData === void 0 ? void 0 : appData.shopName,
            description: appData === null || appData === void 0 ? void 0 : appData.description,
            contact: appData === null || appData === void 0 ? void 0 : appData.contact,
            socialMedia: appData === null || appData === void 0 ? void 0 : appData.socialMedia,
            logo: appData === null || appData === void 0 ? void 0 : appData.logo,
            url: req.protocol + '://' + req.get('host')
        };
        const html = yield (0, helper_1.renderEjs)('email.forget-password', emailData);
        yield EmailJob_1.emailQueue.add(EmailJob_1.emailQueueName, {
            to: email,
            subject: 'Reset your password',
            body: html
        });
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
const resetPasswordService = (req, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.JWT_SECRET);
        const payload = {
            newPassword: req.body.newPassword,
            confirmPassword: req.body.confirmPassword
        };
        const user = yield user_model_1.default.findById(decoded.userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This is user is not found');
        }
        const userStatus = user === null || user === void 0 ? void 0 : user.status;
        if (userStatus === 'blocked' || userStatus === 'inactive') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This is user is blocked or inactive');
        }
        const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, 10);
        yield user_model_1.default.findOneAndUpdate({
            _id: user._id,
            role: user.role
        }, {
            password: newHashedPassword,
            passwordChangedAt: new Date()
        });
        // send email to user for password change confirmation
        const appData = yield storefront_model_1.default.findOne({})
            .select('shopName description contact socialMedia logo')
            .lean();
        const emailData = {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            shopName: appData === null || appData === void 0 ? void 0 : appData.shopName,
            description: appData === null || appData === void 0 ? void 0 : appData.description,
            contact: appData === null || appData === void 0 ? void 0 : appData.contact,
            socialMedia: appData === null || appData === void 0 ? void 0 : appData.socialMedia,
            logo: appData === null || appData === void 0 ? void 0 : appData.logo,
            url: req.protocol + '://' + req.get('host')
        };
        const html = yield (0, helper_1.renderEjs)('email.password-change-success', emailData);
        yield EmailJob_1.emailQueue.add(EmailJob_1.emailQueueName, {
            to: user.email,
            subject: 'Password changed successfully',
            body: html
        });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong, please try again');
    }
});
exports.authService = {
    userRegistration,
    verifyEmail,
    userLogin,
    refreshToken,
    forgetPasswordService,
    resetPasswordService
};
