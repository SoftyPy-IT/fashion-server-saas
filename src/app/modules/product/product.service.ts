import crypto from 'crypto';
import { Request } from 'express';
import httpStatus from 'http-status';
import mongoose, { ObjectId } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import Brand from '../brand/brand.model';
import { Category, MainCategory, SubCategory } from '../category/category.model';
import { FolderModel } from '../image-gallery/image-gallery.model';
import Section from '../section/section.model';
import Supplier from '../supplier/supplier.model';
import { IProduct } from './product.interface';
import Product from './product.model';

export const getAllProduct = async (query: Record<string, unknown>): Promise<any> => {
  const productSearchableFields = ['code'];

  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: false }).populate([
      {
        path: 'category',
        select: 'name slug'
      },
      {
        path: 'mainCategory',
        select: 'name slug'
      },
      {
        path: 'subCategory',
        select: 'name slug'
      }
    ]),
    query
  )
    .search(productSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await productQuery.countTotal();
  const result = await productQuery.queryModel;

  return { meta, result };
};

export const getProductById = async (id: string): Promise<IProduct | null> => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
  }
  return product;
};

export const getProductDetails = async (id: string): Promise<any | null> => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  const queryCondition = isValidObjectId ? { _id: id } : { slug: id };
  try {
    const product = await Product.findOne({ ...queryCondition, isDeleted: false });

    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
    }

    // now here also add 10 related products to this product based on category, subcategory, brand using aggregation

    const relatedProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: product._id },
          isDeleted: false,
          $or: [
            { category: product.category },
            { subCategory: product.subCategory },
            { brand: product.brand }
          ]
        }
      },
      // Lookup category
      {
        $lookup: {
          from: 'categories', // তোমার Category collection-এর নাম
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      // Lookup subCategory
      {
        $lookup: {
          from: 'subcategories', // তোমার SubCategory collection-এর নাম
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategoryDetails'
        }
      },
      // Lookup mainCategory
      {
        $lookup: {
          from: 'maincategories',
          localField: 'mainCategory',
          foreignField: '_id',
          as: 'mainCategoryDetails'
        }
      },

      { $sample: { size: 4 } },
      {
        $project: {
          name: 1,
          slug: 1,
          thumbnail: 1,

          reviews: 1,
          rating: 1,
          price: 1,
          discount_price: 1,
          category: { $arrayElemAt: ['$categoryDetails.name', 0] },
          subCategory: { $arrayElemAt: ['$subCategoryDetails.name', 0] },
          mainCategory: {
            $arrayElemAt: ['$mainCategoryDetails.name', 0]
          }
        }
      }
    ]);

    return {
      product,
      relatedProducts
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createProduct = async (req: Request): Promise<IProduct | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newProduct: IProduct | null = null;

  try {
    const { name, category, subCategory, mainCategory, brand, variants, supplier, folder } =
      req.body;

    // check if folder exists
    if (folder && !(await FolderModel.findById(folder).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    // Check if category exists
    if (!(await Category.findById(category).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    // Check if subCategory exists
    if (subCategory && !(await SubCategory.findById(subCategory).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');
    }

    // Check if mainCategory exists
    if (mainCategory && !(await MainCategory.findById(mainCategory).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'MainCategory not found');
    }

    // Check if brand exists
    if (brand) {
      const existingBrand = await Brand.findById(brand).session(session);
      if (!existingBrand) {
        throw new AppError(httpStatus.NOT_FOUND, 'Brand not found');
      }
    }

    if (supplier && !(await Supplier.findById(supplier).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
    }

    // Create the product
    newProduct = new Product({
      ...req.body,
      quantity: req.body.quantity || 0,
      stock: req.body.quantity || 0,
      slug: name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .concat(`-${crypto.randomBytes(4).toString('hex')}`)
    });

    if (variants && variants.length > 0) {
      newProduct.hasVariants = true;
      newProduct.variants = variants;
      // if variants has quantity, update the quantity of product

      const totalQuantity = variants.reduce(
        (
          acc: number,
          variant: {
            quantity?: number;
          }
        ) => {
          return acc + (variant.quantity || 0);
        },
        0
      );

      newProduct.quantity = totalQuantity;
      newProduct.stock = totalQuantity;
    }

    await newProduct.save({ session });

    // Update brand with new product
    if (brand) {
      const existingBrand = await Brand.findById(brand).session(session);
      if (existingBrand) {
        existingBrand.products.push(newProduct._id);
        await existingBrand.save({ session });
      }
    }

    // Update folder with new product
    if (folder) {
      const folderToUpdate = await FolderModel.findById(folder).session(session);
      if (folderToUpdate) {
        // Check if product is already in the folder
        if (!folderToUpdate.products.includes(newProduct._id)) {
          folderToUpdate.products.push(newProduct._id);
          await folderToUpdate.save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return newProduct;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    // If an error occurred after creating the product, delete the product to maintain data integrity
    if (newProduct) {
      await Product.deleteOne({ _id: newProduct._id }).session(session);
    }

    // Remove the product from category and brand
    if (newProduct?._id) {
      if (newProduct.brand) {
        const brandToUpdate = await Brand.findById(newProduct.brand).session(session);
        if (brandToUpdate) {
          brandToUpdate.products = brandToUpdate.products.filter(
            (product) => product.toString() !== newProduct?._id.toString()
          );
          await brandToUpdate.save({ session });
        }
      }
      // Remove from folder if it was added
      if (newProduct.folder) {
        const folderToUpdate = await FolderModel.findById(newProduct.folder).session(session);
        if (folderToUpdate) {
          folderToUpdate.products = folderToUpdate.products.filter(
            (product) => product.toString() !== newProduct?._id.toString()
          );
          await folderToUpdate.save({ session });
        }
      }
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const updateProduct = async (id: string, req: Request): Promise<IProduct | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findOne({ _id: id, isDeleted: false }).session(session);
    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'This product does not exist');
    }

    const {
      name,
      category,
      subCategory,
      mainCategory,
      brand,
      productTax,
      supplier,
      variants,
      folder,
      ...remainingProductData
    } = req.body;

    // Check if category exists

    if (category && !(await Category.findById(category).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    // Check if subCategory exists

    if (subCategory && !(await SubCategory.findById(subCategory).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');
    }

    // Check if mainCategory exists

    if (mainCategory && !(await MainCategory.findById(mainCategory).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'MainCategory not found');
    }

    // Check if brand exists
    if (brand) {
      const existingBrand = await Brand.findById(brand).session(session);
      if (!existingBrand) {
        throw new AppError(httpStatus.NOT_FOUND, 'Brand not found');
      }
    }

    // check folder exists
    if (folder && !(await FolderModel.findById(folder).session(session))) {
      throw new AppError(httpStatus.NOT_FOUND, 'Folder not found');
    }

    // Update product data
    const updatedData: Partial<IProduct> = {
      name,
      category,
      subCategory,
      mainCategory,
      brand,
      productTax,
      supplier,
      folder,
      variants,
      ...remainingProductData
    };

    if (variants && variants.length > 0) {
      updatedData.hasVariants = true;
      updatedData.variants = variants;

      // Sum all quantities from all variant values
      const totalQuantity = variants.reduce((acc: number, variant: any) => {
        const variantQuantity = variant.values?.reduce((sum: number, value: any) => {
          return sum + (value.quantity || 0);
        }, 0);
        return acc + variantQuantity;
      }, 0);

      updatedData.quantity = totalQuantity;
      updatedData.stock = totalQuantity;
    } else {
      // For products without variants, update both quantity and stock
      updatedData.quantity = req.body.quantity || 0;
      updatedData.stock = req.body.quantity || 0;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
      session
    });

    if (!updatedProduct) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update the product');
    }

    // Update slug if name is updated
    if (name && name !== product.name) {
      updatedProduct.slug = name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .concat(`-${crypto.randomBytes(4).toString('hex')}`);
      await updatedProduct.save({ session });
    }

    // Handle folder updates
    if (folder !== product.folder) {
      // Remove from old folder if exists
      if (product.folder) {
        const oldFolder = await FolderModel.findById(product.folder).session(session);
        if (oldFolder) {
          oldFolder.products = oldFolder.products.filter(
            (prodId) => prodId.toString() !== product._id.toString()
          );
          await oldFolder.save({ session });
        }
      }

      // Add to new folder if provided
      if (folder) {
        const newFolder = await FolderModel.findById(folder).session(session);
        if (newFolder) {
          // Check if product is already in the folder
          if (!newFolder.products.includes(product._id)) {
            newFolder.products.push(product._id);
            await newFolder.save({ session });
          }
        }
      }
    }

    // Update categories' and brand's products
    const handleProductRelations = async () => {
      const removeProductFromEntity = async (EntityModel: any, entityId: ObjectId) => {
        const entity = await EntityModel.findById(entityId).session(session);
        if (entity) {
          entity.products = entity.products.filter(
            (prodId: string) => String(prodId) !== String(product._id)
          );
          await entity.save({ session });
        }
      };

      const addProductToEntity = async (EntityModel: any, entityId: string) => {
        const entity = await EntityModel.findById(entityId).session(session);
        if (entity) {
          entity.products.push(product._id);
          await entity.save({ session });
        }
      };

      // Remove from old relations
      if (product.brand) await removeProductFromEntity(Brand, product.brand);

      // Add to new relations
      if (subCategory) await addProductToEntity(Category, subCategory);
      if (brand) await addProductToEntity(Brand, brand);
    };

    await handleProductRelations();

    await session.commitTransaction();
    session.endSession();

    return updatedProduct;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const deleteProduct = async (id: string): Promise<void | null> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find product that is not deleted
    const product = await Product.findOne({ _id: id, isDeleted: false }).session(session);
    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'This product does not exist');
    }

    // Mark product as deleted
    const deletedProduct = await Product.findByIdAndDelete(id, {
      session,
      new: true
    });
    if (!deletedProduct) {
      throw new AppError(httpStatus.NOT_FOUND, 'Failed to delete product');
    }

    // delete from sections Section Model
    await Section.updateMany(
      { products: deletedProduct._id },
      { $pull: { products: deletedProduct._id } },
      { session }
    );

    // Remove product from all folders that contain it
    await FolderModel.updateMany(
      { products: deletedProduct._id },
      { $pull: { products: deletedProduct._id } },
      { session }
    );

    // Also remove from the specific folder if it exists
    if (deletedProduct.folder) {
      const folderToUpdate = await FolderModel.findById(deletedProduct.folder).session(session);
      if (folderToUpdate) {
        folderToUpdate.products = folderToUpdate.products.filter(
          (productId) => productId.toString() !== deletedProduct._id.toString()
        );
        await folderToUpdate.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const addFeaturedProducts = async (req: Request): Promise<any> => {
  try {
    const { products } = req.body;

    // validate products ids
    if (!products || products.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Please provide products to feature');
    }

    // check if products exist or not deleted
    const existingProducts = await Product.find({
      _id: { $in: products },
      isDeleted: false
    });

    if (existingProducts.length !== products.length) {
      throw new AppError(httpStatus.NOT_FOUND, 'One or more products do not exist');
    }

    // check if products already featured with specified product name
    const featuredProducts = await Product.find({
      _id: { $in: products },
      is_featured: true,
      isDeleted: false
    });

    if (featuredProducts.length > 0) {
      const productNames = featuredProducts.map((product) => product.name);

      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Products ${productNames.join(', ')} are already featured`
      );
    }

    const updatedProducts = await Product.updateMany(
      { _id: { $in: products } },
      { is_featured: true },
      {
        new: true,
        runValidators: true
      }
    );

    return updatedProducts;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

const parseFilter = (filterString: string | undefined): Record<string, any> => {
  return filterString ? JSON.parse(filterString) : {};
};

const buildProductFilter = (filter: any): Record<string, any> => {
  const productFilter: Record<string, any> = {};

  if (filter.priceRange) {
    productFilter.price = {
      $gte: filter.priceRange.min,
      $lte: filter.priceRange.max
    };
  }

  if (filter.variants) {
    Object.keys(filter.variants).forEach((variant) => {
      if (filter.variants[variant].length > 0) {
        productFilter[`variants.values.value`] = { $in: filter.variants[variant] };
      }
    });
  }

  return productFilter;
};

const getFilterOptions = async (): Promise<any> => {
  const products = await Product.find({ isDeleted: false });

  const filterOptions = {
    priceRange: { min: Infinity, max: -Infinity },
    variants: {} as { [key: string]: Map<string, any> }
  };

  products.forEach((product: any) => {
    if (product.price < filterOptions.priceRange.min) filterOptions.priceRange.min = product.price;
    if (product.price > filterOptions.priceRange.max) filterOptions.priceRange.max = product.price;

    if (product.variants) {
      product.variants
        .filter((variant: any) => variant.name !== 'Color') // Exclude "Color" variants
        .forEach((variant: any) => {
          if (!filterOptions.variants[variant.name]) {
            filterOptions.variants[variant.name] = new Map();
          }

          // Combine name and value as a unique key
          variant.values.forEach((value: any) => {
            const uniqueKey = `${value.name}-${value.value}`;
            if (!filterOptions.variants[variant.name].has(uniqueKey)) {
              filterOptions.variants[variant.name].set(uniqueKey, value);
            }
          });
        });
    }
  });

  // Convert Maps to arrays for final output
  const variantsWithUniqueValues: { [key: string]: any[] } = {};
  Object.keys(filterOptions.variants).forEach((key) => {
    variantsWithUniqueValues[key] = Array.from(filterOptions.variants[key].values());
  });

  // Handle cases where price range might still be at initial values
  if (filterOptions.priceRange.min === Infinity) filterOptions.priceRange.min = 0;
  if (filterOptions.priceRange.max === -Infinity) filterOptions.priceRange.max = 0;

  return {
    priceRange: filterOptions.priceRange,
    variants: variantsWithUniqueValues
  };
};

export const getShopProducts = async (req: Request): Promise<any> => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const filter = parseFilter(req.query.filter as string);

    const productFilter = buildProductFilter(filter);

    const totalProducts = await Product.aggregate([
      {
        $match: {
          isDeleted: false,
          ...productFilter
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalProducts.length > 0 ? totalProducts[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    const products = await Product.aggregate([
      {
        $match: {
          isDeleted: false,
          ...productFilter
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategory'
        }
      },
      {
        $lookup: {
          from: 'maincategories', // Ensure collection name is correct
          localField: 'mainCategory',
          foreignField: '_id',
          as: 'mainCategory'
        }
      },

      {
        $project: {
          name: 1,
          code: 1,
          slug: 1,
          thumbnail: 1,
          price: 1,
          rating: 1,
          reviews: 1,
          discount_price: 1,
          category: { $arrayElemAt: ['$category.name', 0] },
          reviewCount: { $size: '$reviews' },
          subCategory: { $arrayElemAt: ['$subCategory.name', 0] },
          mainCategory: { $arrayElemAt: ['$mainCategory.name', 0] }
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    const filterOptions = await getFilterOptions();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages
      },
      filterOptions
    };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

export const productService = {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addFeaturedProducts,
  getProductDetails,
  getShopProducts
};
