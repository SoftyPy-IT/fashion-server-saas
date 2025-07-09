"use strict";
/* eslint-disable no-undef */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const softypy_media_service_1 = require("softypy-media-service");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = __importDefault(require("../product/product.model"));
const user_model_1 = __importDefault(require("./user.model"));
(0, softypy_media_service_1.configureMediaService)({
    baseUrl: 'https://media.fashion.com.bd/api/v1/media',
    apiKey: '27630336ccbaa1c735968a35471c6f4a5df7810f536314140ceb7d1eeec0b77b'
});
const mediaService = (0, softypy_media_service_1.getMediaService)();
const changePassword = (userData, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(userData.userId).select('+password');
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This is user is not found');
        }
        const userStatus = user === null || user === void 0 ? void 0 : user.status;
        if (userStatus === 'blocked' || userStatus === 'inactive') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked or inactive');
        }
        // check password matched or not
        if (!(yield user_model_1.default.comparePassword(data === null || data === void 0 ? void 0 : data.oldPassword, user === null || user === void 0 ? void 0 : user.password))) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This password is not matched with old password');
        }
        //   hashed new password
        const newHashedPassword = yield bcrypt_1.default.hash(data.newPassword, 10);
        yield user_model_1.default.findOneAndUpdate({
            _id: userData.userId,
            role: user.role
        }, {
            password: newHashedPassword,
            passwordChangedAt: new Date()
        });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
const updateProfile = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { firstName, lastName, phone, dateOfBirth, address } = _a, remainingStudentData = __rest(_a, ["firstName", "lastName", "phone", "dateOfBirth", "address"]);
        const avatar = req.file;
        const user = yield user_model_1.default.findById(req.user.userId).select('+password');
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        if (firstName)
            modifiedUpdatedData.firstName = firstName;
        if (lastName)
            modifiedUpdatedData.lastName = lastName;
        if (phone)
            modifiedUpdatedData.phone = phone;
        if (dateOfBirth)
            modifiedUpdatedData.dateOfBirth = dateOfBirth;
        if (address && Object.keys(address).length > 0) {
            for (const [key, value] of Object.entries(address)) {
                modifiedUpdatedData[`address.${key}`] = value;
            }
        }
        if (avatar) {
            try {
                //delete old image from cloudinary
                if (user.avatar && user.avatar && user.avatar.public_id) {
                    yield mediaService.deleteFile(user.avatar.public_id);
                }
                const file = new File([new Uint8Array(avatar.buffer)], avatar.originalname, {
                    type: avatar.mimetype
                });
                //send image to cloudinary
                const { url, publicId } = (yield mediaService.uploadFile(file));
                user.avatar = {
                    url: url,
                    public_id: publicId
                };
                for (const [key, value] of Object.entries(user.avatar)) {
                    modifiedUpdatedData[`avatar.${key}`] = value;
                }
            }
            catch (error) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error);
            }
        }
        const result = yield user_model_1.default.findByIdAndUpdate({ _id: req.user.userId }, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error);
    }
});
const changeStatus = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not registered yet');
    }
    const result = yield user_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
});
const changeUserRole = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not registered yet');
    }
    if (user.status === 'blocked' || user.status === 'inactive') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked or inactive');
    }
    const result = yield user_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const studentSearchableFields = [
        'email',
        'name',
        'phone',
        'address.city',
        'address.country',
        'address.state'
    ];
    const studentQuery = new QueryBuilder_1.default(user_model_1.default.find({
        isDeleted: false
    }), query)
        .search(studentSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield studentQuery.countTotal();
    const result = yield studentQuery.queryModel;
    return {
        meta,
        result
    };
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found');
    }
    return user;
});
const getProlfile = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: userData.userId, isDeleted: false }).populate([
        {
            path: 'wishlist',
            select: 'name price images thumbnail'
        },
        {
            path: 'orders',
            options: { sort: { createdAt: -1 } }
        }
    ]);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found');
    }
    return user;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: id, isDeleted: false });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user does not exist');
    }
    yield user_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, {
        new: true
    });
    return null;
});
const addProductToWishlist = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { productId, action } = req.body;
    try {
        if (action === 'remove') {
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found');
            }
            const product = yield product_model_1.default.findById(productId);
            if (!product) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product is not found');
            }
            if (!user.wishlist.includes(product._id)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This product is not in wishlist');
            }
            yield user_model_1.default.findByIdAndUpdate(userId, {
                $pull: { wishlist: product._id }
            }, {
                new: true
            });
            return 'Product removed from wishlist successfully';
        }
        if (action === 'add') {
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found');
            }
            const product = yield product_model_1.default.findById(productId);
            if (!product) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This product is not found');
            }
            if (user.wishlist.includes(product._id)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This product is already in wishlist');
            }
            yield user_model_1.default.findByIdAndUpdate(userId, {
                $push: { wishlist: product._id }
            }, {
                new: true
            });
        }
        return 'Product added to wishlist successfully';
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
const createUserByAdmin = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email: userData.email });
        if (existingUser) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists with this email');
        }
        // Create new user
        const newUser = yield user_model_1.default.create(Object.assign(Object.assign({}, userData), { status: 'active', isDeleted: false }));
        // Remove password from response
        const _b = newUser.toObject(), { password } = _b, userWithoutPassword = __rest(_b, ["password"]);
        return userWithoutPassword;
    }
    catch (error) {
        throw new AppError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to create user');
    }
});
const updateUserByAdmin = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        // Check if email is being updated and if it's already taken
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = yield user_model_1.default.findOne({ email: updateData.email });
            if (existingUser) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, 'Email already exists');
            }
        }
        const result = yield user_model_1.default.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to update user');
    }
});
exports.userService = {
    changePassword,
    updateProfile,
    changeStatus,
    changeUserRole,
    getProlfile,
    getAllUsers,
    getUserById,
    deleteUser,
    addProductToWishlist,
    createUserByAdmin,
    updateUserByAdmin
};
