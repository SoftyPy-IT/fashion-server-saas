import { Request } from 'express';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import Product from '../product/product.model';
import { Category, MainCategory, SubCategory } from './category.model';
import mongoose from 'mongoose';
import { ICategory, IMainCategory, ISubCategory } from './category.interface';

export const getAllMainCategory = async (query: Record<string, unknown>): Promise<any> => {
  const categorySearchableFields = ['name'];

  const categoryQuery = new QueryBuilder(
    MainCategory.find()
      .sort({ serial: 1 })
      .populate({
        path: 'categories.category',
        select: 'name subCategories image slug',
        populate: {
          path: 'subCategories.subCategory',
          select: 'name slug'
        }
      }),
    query
  )
    .search(categorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  let result = await categoryQuery.queryModel;

  result = result.map((mainCategory) => {
    return {
      ...mainCategory.toObject(),
      categories: mainCategory.categories.sort((a, b) => a.serial - b.serial)
    };
  });

  return { meta, result };
};

export const getAllCategory = async (query: Record<string, unknown>): Promise<any> => {
  const categorySearchableFields = ['name'];
  const categoryQuery = new QueryBuilder(
    Category.find().populate([
      {
        path: 'subCategories.subCategory',
        select: 'name slug mainCategory'
      },
      {
        path: 'mainCategory',
        select: 'name slug serial'
      }
    ]),
    query
  )
    .search(categorySearchableFields)
    .filter()
    .fields();

  const meta = await categoryQuery.countTotal();
  const result = await categoryQuery.queryModel;

  // Group the result by main category
  const groupedCategories = result.reduce((acc: any, category: any) => {
    const mainCategory = category.mainCategory?.name;

    if (mainCategory) {
      if (!acc[mainCategory]) {
        acc[mainCategory] = [];
      }
      acc[mainCategory].push(category);
    }

    return acc;
  }, {});

  return { meta, groupedCategories };
};

export const getAllSubCategory = async (query: Record<string, unknown>): Promise<any> => {
  const categorySearchableFields = ['name'];
  const categoryQuery = new QueryBuilder(
    SubCategory.find()
      .sort({ serial: 1 })
      .populate([
        {
          path: 'category',
          select: 'name slug serial',
          options: { sort: { serial: 1 } }
        }
      ]),
    query
  )
    .search(categorySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  const result = await categoryQuery.queryModel;

  return { meta, result };
};

export const createMainCategory = async (req: Request) => {
  const { name, image, categories } = req.body;

  // Check if the main category already exists
  const existingMainCategory = await MainCategory.findOne({ name });
  if (existingMainCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Main Category already exists');
  }

  // Create slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  // Find the highest serial number to determine the next one
  const highestSerial = await MainCategory.findOne().sort({ serial: -1 }).select('serial');
  const nextSerial = highestSerial ? highestSerial.serial + 1 : 1;

  // Create main category with dynamic serial
  const mainCategoryData = {
    name,
    image,
    slug,
    serial: nextSerial,
    categories: []
  };

  // Check if any categories were provided
  if (categories && categories.length) {
    // Validate that all categories exist
    const validCategories = await Category.find({ _id: { $in: categories } });
    if (validCategories.length !== categories.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'One or more categories do not exist');
    }

    // Add serialized categories
    mainCategoryData.categories = categories.map((categoryId: string, index: number) => ({
      category: categoryId,
      serial: index + 1
    }));

    // Create main category
    const newMainCategory = await MainCategory.create(mainCategoryData);

    // Update the categories to point to this main category
    await Category.updateMany({ _id: { $in: categories } }, { mainCategory: newMainCategory._id });

    return newMainCategory;
  } else {
    // Create main category without categories
    return MainCategory.create(mainCategoryData);
  }
};

export const updateMainCategory = async (req: Request) => {
  const { id } = req.params;
  const { name, image, categories } = req.body;

  // Check if the main category exists
  const existingMainCategory = await MainCategory.findById(id);
  if (!existingMainCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Main Category not found');
  }

  // Create slug from name if name is provided
  const updateData: any = {};
  if (name) {
    updateData.name = name;
    updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
  }

  // Add image to update data if provided
  if (image !== undefined) {
    updateData.image = image;
  }

  // Handle categories if provided
  if (categories !== undefined) {
    // If categories array is empty, clear all categories
    if (!categories.length) {
      updateData.categories = [];

      // Get previous categories to remove references
      const previousCategoryIds = existingMainCategory.categories.map((item: any) =>
        item.category.toString()
      );

      if (previousCategoryIds.length > 0) {
        await Category.updateMany(
          { _id: { $in: previousCategoryIds } },
          { $unset: { mainCategory: '' } }
        );
      }
    } else {
      // Validate that all categories exist
      const validCategories = await Category.find({ _id: { $in: categories } });
      if (validCategories.length !== categories.length) {
        throw new AppError(httpStatus.BAD_REQUEST, 'One or more categories do not exist');
      }

      updateData.categories = categories.map((categoryId: string, index: number) => ({
        category: categoryId,
        serial: index + 1
      }));

      // Get previous categories that are no longer in the list
      const previousCategoryIds = existingMainCategory.categories.map((item: any) =>
        item.category.toString()
      );
      const removedCategoryIds = previousCategoryIds.filter(
        (id: string) => !categories.includes(id)
      );

      // Update categories to point to this main category
      await Category.updateMany({ _id: { $in: categories } }, { mainCategory: id });

      // Remove reference for categories no longer in the list
      if (removedCategoryIds.length > 0) {
        await Category.updateMany(
          { _id: { $in: removedCategoryIds } },
          { $unset: { mainCategory: '' } }
        );
      }
    }
  }

  // Update the main category
  return MainCategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const createCategory = async (req: Request) => {
  const { name, image, subCategories, mainCategory } = req.body;

  // Create slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  // Check if the category already exists with the same name
  const existingCategory = await Category.findOne({
    name,
    mainCategory: mainCategory || { $exists: false }
  });

  if (existingCategory) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      mainCategory
        ? 'Category with this name already exists under the selected main category'
        : 'Category with this name already exists without a main category'
    );
  }

  // Prepare category data
  const categoryData: any = {
    name,
    slug,
    subCategories: []
  };

  if (image !== undefined) categoryData.image = image;

  // Validate and handle main category if provided
  if (mainCategory) {
    const validMainCategory = await MainCategory.findById(mainCategory);
    if (!validMainCategory) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Main Category does not exist');
    }
    categoryData.mainCategory = mainCategory;
  }

  // Validate and handle sub-categories if provided
  if (subCategories && subCategories.length > 0) {
    const validSubCategories = await SubCategory.find({ _id: { $in: subCategories } });
    if (validSubCategories.length !== subCategories.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'One or more subCategories do not exist');
    }

    categoryData.subCategories = subCategories.map((subCategoryId: string, index: number) => ({
      subCategory: subCategoryId,
      serial: index + 1
    }));
  }

  // Create the category
  const newCategory = await Category.create(categoryData);

  // Update subcategories to reference this category if provided
  if (subCategories && subCategories.length > 0) {
    await SubCategory.updateMany({ _id: { $in: subCategories } }, { category: newCategory._id });
  }

  // If main category provided, add this category to the main category's categories list
  if (mainCategory) {
    // Find the highest serial in the main category's categories
    const mainCategoryDoc = await MainCategory.findById(mainCategory);
    const categories = mainCategoryDoc?.categories || [];
    const highestSerial =
      categories.length > 0 ? Math.max(...categories.map((c: any) => c.serial)) : 0;

    await MainCategory.findByIdAndUpdate(mainCategory, {
      $push: { categories: { category: newCategory._id, serial: highestSerial + 1 } }
    });
  }

  return newCategory;
};

export const updateCategory = async (req: Request) => {
  const { id } = req.params;
  const {
    name,
    image,
    subCategories,
    mainCategory: newMainCategory,
    isActive,
    isUpdateStatus
  } = req.body;

  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  console.log(existingCategory.mainCategory);
  console.log(isActive);

  // update the isActive true or false in category field associated with the main category
  if (isActive !== undefined && existingCategory.mainCategory) {
    const mainCategoryDoc = await MainCategory.findById(existingCategory.mainCategory);
    if (mainCategoryDoc) {
      const category = mainCategoryDoc.categories.find((c: any) => c.category.toString() === id);
      if (category) {
        await MainCategory.updateOne(
          {
            _id: existingCategory.mainCategory,
            'categories.category': id
          },
          {
            $set: { 'categories.$.isActive': isActive }
          }
        );
      }
    }
  }

  // Prepare update data
  const updateData: any = {};

  // Update name and slug if provided
  if (name) {
    updateData.name = name;
    updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
  }

  // Update image if provided
  if (image !== undefined) {
    updateData.image = image;
  }

  // Set isActive if provided (only when isUpdateStatus is true)
  if (isActive !== undefined && isUpdateStatus) {
    updateData.isActive = isActive;
  }

  // Handle main category changes if provided
  if (newMainCategory !== undefined) {
    // If newMainCategory is null or empty string, remove the association
    if (!newMainCategory) {
      // Remove from old main category if exists
      if (existingCategory.mainCategory) {
        await MainCategory.findByIdAndUpdate(existingCategory.mainCategory, {
          $pull: { categories: { category: id } }
        });
        updateData.$unset = { mainCategory: '' };
      }
    } else {
      // Validate the new main category exists
      const validMainCategory = await MainCategory.findById(newMainCategory);
      if (!validMainCategory) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Main Category does not exist');
      }

      // If main category is changing
      if (
        !existingCategory.mainCategory ||
        existingCategory.mainCategory.toString() !== newMainCategory
      ) {
        // Remove from old main category if exists
        if (existingCategory.mainCategory) {
          await MainCategory.findByIdAndUpdate(existingCategory.mainCategory, {
            $pull: { categories: { category: id } }
          });
        }

        // Find the highest serial in the main category's categories
        const categories = validMainCategory.categories || [];
        const highestSerial =
          categories.length > 0 ? Math.max(...categories.map((c: any) => c.serial)) : 0;

        // Add to new main category with next serial
        await MainCategory.findByIdAndUpdate(newMainCategory, {
          $push: {
            categories: {
              category: id,
              serial: highestSerial + 1,
              isActive: isActive !== undefined ? isActive : existingCategory.isActive
            }
          }
        });
      }

      updateData.mainCategory = newMainCategory;
    }
  }

  // Handle subcategories if provided
  if (subCategories !== undefined) {
    // If subCategories is empty, clear all associations
    if (!subCategories.length) {
      updateData.subCategories = [];

      // Get existing subcategories to remove references
      const previousSubCategoryIds = existingCategory.subCategories.map((item: any) =>
        item.subCategory.toString()
      );

      if (previousSubCategoryIds.length > 0) {
        await SubCategory.updateMany(
          { _id: { $in: previousSubCategoryIds } },
          { $unset: { category: '' } }
        );
      }
    } else {
      // Validate that all subCategories exist
      const validSubCategories = await SubCategory.find({ _id: { $in: subCategories } });
      if (validSubCategories.length !== subCategories.length) {
        throw new AppError(httpStatus.BAD_REQUEST, 'One or more subCategories do not exist');
      }

      updateData.subCategories = subCategories.map((subCategoryId: string, index: number) => ({
        subCategory: subCategoryId,
        serial: index + 1
      }));

      // Get previous subcategories that are no longer in the list
      const previousSubCategoryIds = existingCategory.subCategories.map((item: any) =>
        item.subCategory.toString()
      );
      const removedSubCategoryIds = previousSubCategoryIds.filter(
        (id: string) => !subCategories.includes(id)
      );

      // Update subcategories to point to this category
      await SubCategory.updateMany({ _id: { $in: subCategories } }, { category: id });

      // Remove reference for subcategories no longer in the list
      if (removedSubCategoryIds.length > 0) {
        await SubCategory.updateMany(
          { _id: { $in: removedSubCategoryIds } },
          { $unset: { category: '' } }
        );
      }
    }
  }

  // Update the category
  return Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const createSubCategory = async (req: Request) => {
  const { name } = req.body;

  // Check if the subCategory already exists
  const existingSubCategory = await SubCategory.findOne({ name });
  if (existingSubCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, 'SubCategory already exists');
  }

  // Create the subCategory
  return SubCategory.create({
    name,
    slug: name.toLowerCase().replace(/ /g, '-')
  });
};

export const updateSubCategory = async (req: Request) => {
  const { id } = req.params;
  const { name } = req.body;

  // Check if the subCategory exists
  const existingSubCategory = await SubCategory.findById(id);
  if (!existingSubCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }

  // Update the subCategory
  return SubCategory.findByIdAndUpdate(
    id,
    { name, slug: name.toLowerCase().replace(/ /g, '-') },
    { new: true, runValidators: true }
  );
};

export const deleteMainCategory = async (id: string) => {
  const existingMainCategory = await MainCategory.findById(id);
  if (!existingMainCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Main Category not found');
  }

  // Get all categories associated with this main category
  const categoryIds = existingMainCategory.categories.map((item: any) => item.category);

  // Remove main category reference from all associated categories
  if (categoryIds && categoryIds.length > 0) {
    await Category.updateMany({ _id: { $in: categoryIds } }, { $unset: { mainCategory: '' } });
  }

  // Delete the main category
  await MainCategory.findByIdAndDelete(id);
  return null;
};

export const deleteCategory = async (id: string) => {
  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // Remove category from main category if it belongs to one
  if (existingCategory.mainCategory) {
    await MainCategory.findByIdAndUpdate(existingCategory.mainCategory, {
      $pull: { categories: { category: id } }
    });
  }

  // Get all subcategories associated with this category
  const subCategoryIds = existingCategory.subCategories.map((item: any) => item.subCategory);

  // Remove category reference from all associated subcategories
  if (subCategoryIds && subCategoryIds.length > 0) {
    await SubCategory.updateMany({ _id: { $in: subCategoryIds } }, { $unset: { category: '' } });
  }

  // Delete the category
  await Category.findByIdAndDelete(id);
  return null;
};

export const deleteSubCategory = async (id: string) => {
  const existingSubCategory = await SubCategory.findById(id);
  if (!existingSubCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }

  // Remove subcategory from any category that includes it
  if (existingSubCategory.category) {
    await Category.findByIdAndUpdate(existingSubCategory.category, {
      $pull: { subCategories: { subCategory: id } }
    });
  }

  // Delete the subcategory
  await SubCategory.findByIdAndDelete(id);
  return null;
};

export const getFullCategoryTree = async () => {
  try {
    // Fetch the main categories and populate category and subcategory data
    const mainCategories = await MainCategory.find()
      .sort({ serial: 1 })
      .populate({
        path: 'categories.category',
        populate: {
          path: 'subCategories.subCategory' // Populate the subcategories field
        }
      })
      .lean()
      .exec();

    // Filter out inactive categories and sort them
    mainCategories.forEach((mainCategory: IMainCategory) => {
      // Remove inactive categories
      mainCategory.categories = mainCategory.categories.filter(
        (cat) => cat.category && cat.category.isActive
      );

      // Sort Categories within each MainCategory by serial
      mainCategory.categories.sort((a, b) => a.serial - b.serial);

      // Sort Subcategories within each Category by serial
      mainCategory.categories.forEach((category) => {
        if (category.category && category.category.subCategories) {
          category.category.subCategories.sort((a, b) => a.serial - b.serial);
        }
      });
    });

    return mainCategories;
  } catch (error) {
    console.error(error);
    throw new AppError(httpStatus.BAD_REQUEST, 'Error fetching category tree');
  }
};

const updateCategoryTree = async (req: Request): Promise<{ success: boolean; message: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { categories, mainCategoryId } = req.body;

    // Validate main category
    const mainCategory = await MainCategory.findById(mainCategoryId)
      .populate('categories.category')
      .session(session);

    if (!mainCategory) {
      throw new AppError(httpStatus.NOT_FOUND, `Main Category with ID ${mainCategoryId} not found`);
    }

    // Create a map to store updated subcategories for each category
    const categorySubcategoriesMap = new Map();

    // First pass: Process all categories and create their subcategory arrays
    for (const categoryUpdate of categories) {
      const subCategories =
        categoryUpdate.subCategories?.map((sub: { subCategoryId: string; serial: number }) => ({
          subCategory: sub.subCategoryId,
          serial: sub.serial
        })) || [];

      categorySubcategoriesMap.set(categoryUpdate.categoryId, subCategories);

      // Update category serial in main category
      await MainCategory.updateOne(
        {
          _id: mainCategoryId,
          'categories.category': categoryUpdate.categoryId
        },
        {
          $set: { 'categories.$.serial': categoryUpdate.serial }
        },
        { session }
      );
    }

    // Second pass: Update each category with its specific subcategories
    const updatePromises = Array.from(categorySubcategoriesMap.entries()).map(
      ([categoryId, subcategories]) =>
        Category.findByIdAndUpdate(
          categoryId,
          { $set: { subCategories: subcategories } },
          { session, new: true }
        )
    );

    await Promise.all(updatePromises);

    await session.commitTransaction();
    return { success: true, message: 'Category tree updated successfully' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getProductsByCategory = async (query: Record<string, unknown>): Promise<any> => {
  const { main: mainCategorySlug, cat: categorySlug, sub: subcategorySlug, ...restQuery } = query;

  // Build base query conditions
  const queryConditions: Record<string, unknown> = {
    is_active: true,
    isDeleted: false
  };

  // Check if any category slugs are provided
  if (mainCategorySlug || categorySlug || subcategorySlug) {
    const mainCategory = mainCategorySlug
      ? await MainCategory.findOne({ slug: mainCategorySlug }).select('_id')
      : null;

    const category =
      categorySlug && mainCategory
        ? await Category.findOne({
            slug: categorySlug,
            mainCategory: mainCategory._id
          }).select('_id')
        : null;

    const subCategory =
      subcategorySlug && category
        ? await SubCategory.findOne({
            slug: subcategorySlug,
            category: category._id
          }).select('_id')
        : null;

    // Update the query conditions based on the found categories
    if (mainCategory) {
      queryConditions.mainCategory = mainCategory._id;
    }

    if (category) {
      queryConditions.category = category._id;
    }

    if (subCategory) {
      queryConditions.subCategory = subCategory._id;
    }

    // If no valid category was found, throw an error
    if (!mainCategory && !category && !subCategory) {
      throw new AppError(httpStatus.NOT_FOUND, 'No category found with the provided slugs');
    }
  }

  // Merge with any additional query conditions
  const finalQuery = { ...queryConditions, ...restQuery };

  // Set up the population options for related data
  const productPopulateOptions = [
    { path: 'brand' },
    { path: 'productUnit' },
    { path: 'reviews' },
    { path: 'mainCategory', select: 'name slug' },
    { path: 'category', select: 'name slug' },
    { path: 'subCategory', select: 'name slug' }
  ];

  // Define searchable fields for the products
  const productSearchableFields = ['name', 'description', 'tags'];

  // Build the query using QueryBuilder
  const productsQuery = new QueryBuilder(
    Product.find(queryConditions).populate(productPopulateOptions),
    finalQuery
  )
    .search(productSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  // Execute the query to get products and count metadata
  const meta = await productsQuery.countTotal();
  const result = await productsQuery.queryModel;

  // Return both the meta (pagination info) and the result (product data)
  return {
    meta,
    result
  };
};

enum ModelType {
  Category = 'Category',
  SubCategory = 'SubCategory',
  MainCategory = 'MainCategory'
}

// Define a mapping of model types
const modelMap = {
  [ModelType.Category]: Category,
  [ModelType.SubCategory]: SubCategory,
  [ModelType.MainCategory]: MainCategory
};

export const updateCategoryOrder = async (req: Request) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const { modelType, data } = req.body as {
        modelType: ModelType;
        data: { _id: string }[]; // Ignore serial from client
      };

      const Model = modelMap[modelType];
      if (!Model) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid model type');
      }

      // Loop through data and assign sequential serial numbers (starting from 1)
      for (let index = 0; index < data.length; index++) {
        const { _id } = data[index];
        await (Model as mongoose.Model<any>).findByIdAndUpdate(
          _id,
          { serial: index + 1 },
          { new: true, session }
        );
      }
    });

    return null;
  } catch (error) {
    console.error(error);
    throw new AppError(httpStatus.BAD_REQUEST, 'Error updating category order');
  } finally {
    session.endSession();
  }
};

const getMainCategories = async () => {
  const mainCategories = await MainCategory.find()
    .select('name slug image serial')
    .sort({ serial: 1 });

  return mainCategories;
};

const getCategoriesByMainCategory = async (mainCategoryId: string) => {
  const mainCategory = await MainCategory.findById(mainCategoryId);

  if (!mainCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Main Category not found');
  }

  const categories = await Category.find({ mainCategory: mainCategoryId })
    .select('name slug image serial')
    .sort({ serial: 1 });

  return categories;
};

const getSubCategoriesByCategory = async (categoryId: string) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const subCategories = await SubCategory.find({ category: categoryId })
    .select('name slug serial')
    .sort({ serial: 1 });

  return subCategories;
};

export const categoryService = {
  getAllCategory,
  getAllMainCategory,
  getAllSubCategory,
  createMainCategory,
  createCategory,
  createSubCategory,
  updateMainCategory,
  updateCategory,
  updateSubCategory,
  deleteMainCategory,
  deleteCategory,
  deleteSubCategory,
  getFullCategoryTree,
  getProductsByCategory,
  updateCategoryOrder,
  updateCategoryTree,
  getCategoriesByMainCategory,
  getSubCategoriesByCategory,
  getMainCategories
};
