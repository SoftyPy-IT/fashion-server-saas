import Section from './section.model';
import { ISection } from './section.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import Product from '../product/product.model';

export const getAllSection = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const sectionSearchableFields = ['name'];

    const sectionQuery = new QueryBuilder(
      Section.find({}).populate({
        path: 'products',
        match: {
          isDeleted: false
        },
        select: 'name code price thumbnail discount_price short_description category images slug',
        populate: [
          {
            path: 'category', // Populate the category field
            select: 'name slug' // Select fields you want from the category collection
          },
          {
            path: 'mainCategory',
            select: 'name slug'
          },
          {
            path: 'subCategory',
            select: 'name slug'
          }
        ]
      }),
      query
    )

      .search(sectionSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await sectionQuery.countTotal();
    const result = await sectionQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getSectionById = async (id: string, req: Request): Promise<any | null> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const searchTerm = req.query.searchTerm as string;

    const section = await Section.findOne({ _id: id });
    if (!section) {
      throw new AppError(httpStatus.NOT_FOUND, 'This section is not found');
    }

    const totalProducts = await Section.aggregate([
      { $match: { _id: section._id } },
      { $unwind: '$products' },
      { $count: 'total' }
    ]);

    const total = totalProducts[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const products = await Section.findOne({ _id: id })
      .populate({
        path: 'products',
        options: {
          skip: (page - 1) * limit,
          limit
        },
        match: {
          name: searchTerm ? { $regex: searchTerm, $options: 'i' } : { $exists: true }
        },
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'mainCategory', select: 'name' },
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' },
          { path: 'productUnit', select: 'name' },
          { path: 'defaultSaleUnit', select: 'name' },
          { path: 'defaultPurchaseUnit', select: 'name' },
          { path: 'productTax', select: 'name' },
          { path: 'supplier', select: 'company' }
        ]
      })
      .select('products');

    if (!products) {
      throw new AppError(httpStatus.NOT_FOUND, 'This offer is not found');
    }

    const result = {
      ...section.toJSON(),
      products: {
        products: products.products,
        meta: {
          total,
          page,
          limit,
          totalPages
        }
      }
    };

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createSection = async (req: Request): Promise<ISection | null> => {
  try {
    const { products } = req.body;

    // check products exist or not in the database
    const isProductsExist = await Product.find({ _id: { $in: products } });

    if (products && products.length !== isProductsExist.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${products.length - isProductsExist.length} products not found`
      );
    }

    const result = await Section.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateSection = async (id: string, req: Request): Promise<ISection | null> => {
  try {
    const { title, products, productId, action, type, images } = req.body;

    // Check if the section with the same title exists (excluding the current section)
    const isExist = await Section.findOne({ title, _id: { $ne: id } });
    if (isExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This section already exists');
    }

    // Fetch the section by ID
    const section = await Section.findById(id);
    if (!section) {
      throw new AppError(httpStatus.NOT_FOUND, 'This section does not exist');
    }

    // If products are provided, validate their existence in the database
    if (products && products.length > 0) {
      const validProducts = await Product.find({ _id: { $in: products } });

      // Check for missing products
      if (products.length !== validProducts.length) {
        const validProductIds = validProducts.map((product) => product._id.toString());
        const missingProducts = products.filter(
          (productId: any) => !validProductIds.includes(productId)
        );
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Products not found: ${missingProducts.join(', ')}`
        );
      }

      // Add valid products to the section, avoiding duplicates
      section.products = Array.from(
        new Set([...section.products.map((product) => product.toString()), ...products])
      );
    }

    // Handle product add/remove actions
    if (productId && action) {
      if (action === 'add') {
        if (!section.products.includes(productId)) {
          section.products.push(productId);
        } else {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Product already exists in the section: ${productId}`
          );
        }
      } else if (action === 'remove') {
        section.products = section.products.filter((product) => product.toString() !== productId);
      }
    }

    // Update other fields if provided
    if (title) section.title = title;
    if (req.body.subTitle) section.subTitle = req.body.subTitle;
    if (req.body.description) section.description = req.body.description;

    // ✅ Fix: Only update images if type !== "product" and images is valid
    if (type !== 'product' && images !== undefined && images !== null) {
      if (typeof images === 'object' && !Array.isArray(images)) {
        if (
          (images.desktop === undefined || Array.isArray(images.desktop)) &&
          (images.mobile === undefined || Array.isArray(images.mobile))
        ) {
          section.images = images;
        } else {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid images format: desktop and mobile must be arrays'
          );
        }
      } else {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Invalid images format: should be an object with desktop & mobile arrays'
        );
      }
    }

    if (req.body.style) section.style = req.body.style;
    if (req.body.row) section.row = req.body.row;

    // Save the updated section
    const result = await section.save();

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteSection = async (id: string): Promise<void | null> => {
  try {
    const section = await Section.findOne({ _id: id });
    if (!section) {
      throw new AppError(httpStatus.NOT_FOUND, 'This section is not found');
    }

    await Section.findByIdAndDelete(id);
    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const sectionService = {
  getAllSection,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
};
