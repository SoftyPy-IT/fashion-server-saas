import Unit from './unit.model';
import { IUnit } from './unit.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllUnit = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const unitSearchableFields = ['name'];

    const unitQuery = new QueryBuilder(
      Unit.find({
        isDeleted: false
      }).populate('base_unit'),
      query
    )
      .search(unitSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await unitQuery.countTotal();
    const result = await unitQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getUnitById = async (id: string): Promise<IUnit | null> => {
  try {
    const unit = await Unit.findOne({ _id: id, isDeleted: false });
    if (!unit) {
      throw new AppError(httpStatus.NOT_FOUND, 'This unit is not found');
    }
    return unit;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createUnit = async (req: Request): Promise<IUnit | null> => {
  try {
    const { name, unit_code, base_unit } = req.body;

    const isUnitExist = await Unit.findOne({ name, unit_code, isDeleted: false });

    if (isUnitExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This unit already exists');
    }

    if (base_unit) {
      const isBaseUnitExist = await Unit.findOne({ _id: base_unit, isDeleted: false });
      if (!isBaseUnitExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This base unit does not exist');
      }
    }

    const result = await Unit.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateUnit = async (id: string, req: Request): Promise<IUnit | null> => {
  try {
    const unit = await Unit.findOne({ _id: id, isDeleted: false });
    if (!unit) {
      throw new AppError(httpStatus.NOT_FOUND, 'This unit does not exist');
    }

    const { unit_code, name, base_unit, operator, operation_value, ...remainingStudentData } =
      req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    if (unit_code) {
      modifiedUpdatedData.unit_code = unit_code;
    }

    if (name) {
      modifiedUpdatedData.name = name;
    }

    if (base_unit) {
      const isBaseUnitExist = await Unit.findOne({ _id: base_unit, isDeleted: false });
      if (!isBaseUnitExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This base unit does not exist');
      }
      modifiedUpdatedData.base_unit = base_unit;
    }

    if (operator) {
      modifiedUpdatedData.operator = operator;
    }

    if (operation_value) {
      modifiedUpdatedData.operation_value = operation_value;
    }

    const result = await Unit.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteUnit = async (id: string): Promise<void | null> => {
  try {
    const unit = await Unit.findOne({ _id: id, isDeleted: false });
    if (!unit) {
      throw new AppError(httpStatus.NOT_FOUND, 'This unit is not found');
    }

    await Unit.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const unitService = {
  getAllUnit,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
};
