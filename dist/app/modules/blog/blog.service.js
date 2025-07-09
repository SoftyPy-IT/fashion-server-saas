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
exports.blogService = exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getAllBlog = void 0;
const blog_model_1 = __importDefault(require("./blog.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllBlog = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogSearchableFields = ['name'];
        const blogQuery = new QueryBuilder_1.default(blog_model_1.default.find({}), query)
            .search(blogSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield blogQuery.countTotal();
        const result = yield blogQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllBlog = getAllBlog;
const getBlogById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(id);
    const queryCondition = isValidObjectId ? { _id: id } : { slug: id };
    try {
        const blog = yield blog_model_1.default.findOne(Object.assign({}, queryCondition));
        if (!blog) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This blog is not found');
        }
        return blog;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getBlogById = getBlogById;
const createBlog = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield blog_model_1.default.create(Object.assign(Object.assign({}, req.body), { slug: req.body.title.toLowerCase().split(' ').join('-') }));
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createBlog = createBlog;
const updateBlog = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_model_1.default.findOne({ _id: id });
        if (!blog) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This blog does not exist');
        }
        const remainingStudentData = __rest(req.body, []);
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        if (req.body.title) {
            modifiedUpdatedData.slug = req.body.title.toLowerCase().split(' ').join('-');
        }
        const result = yield blog_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateBlog = updateBlog;
const deleteBlog = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_model_1.default.findOne({ _id: id });
        if (!blog) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This blog is not found');
        }
        yield blog_model_1.default.deleteOne({
            _id: id
        });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteBlog = deleteBlog;
exports.blogService = {
    getAllBlog: exports.getAllBlog,
    getBlogById: exports.getBlogById,
    createBlog: exports.createBlog,
    updateBlog: exports.updateBlog,
    deleteBlog: exports.deleteBlog
};
