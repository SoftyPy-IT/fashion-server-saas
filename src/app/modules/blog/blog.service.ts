import Blog from './blog.model';
import { IBlog } from './blog.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import mongoose from 'mongoose';

export const getAllBlog = async (query: Record<string, unknown>): Promise<any> => {
  try {
    const blogSearchableFields = ['name'];

    const blogQuery = new QueryBuilder(Blog.find({}), query)
      .search(blogSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await blogQuery.countTotal();
    const result = await blogQuery.queryModel;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const getBlogById = async (id: string): Promise<IBlog | null> => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  const queryCondition = isValidObjectId ? { _id: id } : { slug: id };
  try {
    const blog = await Blog.findOne({ ...queryCondition });
    if (!blog) {
      throw new AppError(httpStatus.NOT_FOUND, 'This blog is not found');
    }
    return blog;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const createBlog = async (req: Request): Promise<IBlog | null> => {
  try {
    const result = await Blog.create({
      ...req.body,
      slug: req.body.title.toLowerCase().split(' ').join('-')
    });
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const updateBlog = async (id: string, req: Request): Promise<IBlog | null> => {
  try {
    const blog = await Blog.findOne({ _id: id });
    if (!blog) {
      throw new AppError(httpStatus.NOT_FOUND, 'This blog does not exist');
    }

    const { ...remainingStudentData } = req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    if (req.body.title) {
      modifiedUpdatedData.slug = req.body.title.toLowerCase().split(' ').join('-');
    }

    const result = await Blog.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const deleteBlog = async (id: string): Promise<void | null> => {
  try {
    const blog = await Blog.findOne({ _id: id });
    if (!blog) {
      throw new AppError(httpStatus.NOT_FOUND, 'This blog is not found');
    }

    await Blog.deleteOne({
      _id: id
    });
    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

export const blogService = {
  getAllBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
