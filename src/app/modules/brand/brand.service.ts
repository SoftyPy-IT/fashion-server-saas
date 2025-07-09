import Brand from './brand.model';
import { IBrand } from './brand.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAllBrand = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const brandSearchableFields = ['name'];

    const brandQuery = new QueryBuilder(
      Brand.find({
        isDeleted: false
      }),
      query
    )
      .search(brandSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await brandQuery.countTotal();
    const result = await brandQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

export const getBrandById = async (id: string): Promise<IBrand | null> => {
  const brand = await Brand.findOne({ _id: id, isDeleted: false });
  if (!brand) {
    throw new AppError(httpStatus.NOT_FOUND, 'This brand is not found');
  }
  return brand;
};

export const createBrand = async (req: Request): Promise<IBrand | null> => {
  const { name } = req.body;

  try {
    if (await Brand.isBrandExists(name)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This brand is already exists');
    }

    const result = await Brand.create({
      ...req.body,
      slug: name.toLowerCase().replace(/ /g, '-')
    });

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

export const updateBrand = async (id: string, req: Request): Promise<IBrand | null> => {
  try {
    const brand = await Brand.findById(id, { isDeleted: false });
    if (!brand) {
      throw new AppError(httpStatus.NOT_FOUND, 'This brand is not found');
    }

    const { name, description, image, ...remainingStudentData } = req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    // check this brand name already exists except the current brand
    if (name && name !== brand.name) {
      if (await Brand.isBrandExists(name)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This brand name already exists');
      }
    }

    if (name) {
      modifiedUpdatedData.name = name;
      modifiedUpdatedData.slug = name.toLowerCase().replace(/ /g, '-');
    }
    if (description) {
      modifiedUpdatedData.description = description;
    }

    if (image) {
      modifiedUpdatedData.image = image;
    }

    const result = await Brand.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

export const deleteBrand = async (id: string): Promise<void | null> => {
  const brand = await Brand.findOne({ _id: id, isDeleted: false });
  if (!brand) {
    throw new AppError(httpStatus.NOT_FOUND, 'This brand does not exist');
  }

  // check if the brand has any products

  const isBrandHasProducts = await Brand.findOne({
    _id: id,
    products: { $exists: true, $ne: [] }
  });

  if (isBrandHasProducts) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This brand has products, please delete the products first'
    );
  }

  await Brand.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

  return null;
};

export const brandService = {
  getAllBrand,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
