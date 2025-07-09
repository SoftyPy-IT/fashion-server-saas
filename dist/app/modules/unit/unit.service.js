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
exports.unitService = exports.deleteUnit = exports.updateUnit = exports.createUnit = exports.getUnitById = exports.getAllUnit = void 0;
const unit_model_1 = __importDefault(require("./unit.model"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const getAllUnit = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unitSearchableFields = ['name'];
        const unitQuery = new QueryBuilder_1.default(unit_model_1.default.find({
            isDeleted: false
        }).populate('base_unit'), query)
            .search(unitSearchableFields)
            .filter()
            .sort()
            .paginate()
            .fields();
        const meta = yield unitQuery.countTotal();
        const result = yield unitQuery.queryModel;
        return { meta, result };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getAllUnit = getAllUnit;
const getUnitById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unit = yield unit_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!unit) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This unit is not found');
        }
        return unit;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.getUnitById = getUnitById;
const createUnit = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, unit_code, base_unit } = req.body;
        const isUnitExist = yield unit_model_1.default.findOne({ name, unit_code, isDeleted: false });
        if (isUnitExist) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This unit already exists');
        }
        if (base_unit) {
            const isBaseUnitExist = yield unit_model_1.default.findOne({ _id: base_unit, isDeleted: false });
            if (!isBaseUnitExist) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This base unit does not exist');
            }
        }
        const result = yield unit_model_1.default.create(req.body);
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.createUnit = createUnit;
const updateUnit = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unit = yield unit_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!unit) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This unit does not exist');
        }
        const _a = req.body, { unit_code, name, base_unit, operator, operation_value } = _a, remainingStudentData = __rest(_a, ["unit_code", "name", "base_unit", "operator", "operation_value"]);
        const modifiedUpdatedData = Object.assign({}, remainingStudentData);
        if (unit_code) {
            modifiedUpdatedData.unit_code = unit_code;
        }
        if (name) {
            modifiedUpdatedData.name = name;
        }
        if (base_unit) {
            const isBaseUnitExist = yield unit_model_1.default.findOne({ _id: base_unit, isDeleted: false });
            if (!isBaseUnitExist) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This base unit does not exist');
            }
            modifiedUpdatedData.base_unit = base_unit;
        }
        if (operator) {
            modifiedUpdatedData.operator = operator;
        }
        if (operation_value) {
            modifiedUpdatedData.operation_value = operation_value;
        }
        const result = yield unit_model_1.default.findByIdAndUpdate(id, modifiedUpdatedData, {
            new: true,
            runValidators: true
        });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.updateUnit = updateUnit;
const deleteUnit = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unit = yield unit_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!unit) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This unit is not found');
        }
        yield unit_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return null;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
    }
});
exports.deleteUnit = deleteUnit;
exports.unitService = {
    getAllUnit: exports.getAllUnit,
    getUnitById: exports.getUnitById,
    createUnit: exports.createUnit,
    updateUnit: exports.updateUnit,
    deleteUnit: exports.deleteUnit
};
