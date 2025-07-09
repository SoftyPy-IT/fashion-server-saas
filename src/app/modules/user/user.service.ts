/* eslint-disable no-undef */

import bcrypt from 'bcrypt';
import { Request } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { configureMediaService, getMediaService, UploadResponse } from 'softypy-media-service';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import Product from '../product/product.model';
import User from './user.model';

configureMediaService({
  baseUrl: 'https://media.fashion.com.bd/api/v1/media',
  apiKey: '27630336ccbaa1c735968a35471c6f4a5df7810f536314140ceb7d1eeec0b77b'
});

const mediaService = getMediaService();

const changePassword = async (
  userData: JwtPayload,
  data: {
    oldPassword: string;
    newPassword: string;
  }
) => {
  try {
    const user = await User.findById(userData.userId).select('+password');
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This is user is not found');
    }

    const userStatus = user?.status;
    if (userStatus === 'blocked' || userStatus === 'inactive') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked or inactive');
    }

    // check password matched or not
    if (!(await User.comparePassword(data?.oldPassword, user?.password))) {
      throw new AppError(httpStatus.FORBIDDEN, 'This password is not matched with old password');
    }

    //   hashed new password
    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);

    await User.findOneAndUpdate(
      {
        _id: userData.userId,
        role: user.role
      },
      {
        password: newHashedPassword,
        passwordChangedAt: new Date()
      }
    );

    return null;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateProfile = async (req: Request) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, address, ...remainingStudentData } = req.body;
    const avatar = req.file as Express.Multer.File;

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingStudentData
    };

    if (firstName) modifiedUpdatedData.firstName = firstName;
    if (lastName) modifiedUpdatedData.lastName = lastName;
    if (phone) modifiedUpdatedData.phone = phone;
    if (dateOfBirth) modifiedUpdatedData.dateOfBirth = dateOfBirth;
    if (address && Object.keys(address).length > 0) {
      for (const [key, value] of Object.entries(address)) {
        modifiedUpdatedData[`address.${key}`] = value;
      }
    }

    if (avatar) {
      try {
        //delete old image from cloudinary
        if (user.avatar && user.avatar && user.avatar.public_id) {
          await mediaService.deleteFile(user.avatar.public_id);
        }
        const file = new File([new Uint8Array(avatar.buffer)], avatar.originalname, {
          type: avatar.mimetype
        });
        //send image to cloudinary
        const { url, publicId } = (await mediaService.uploadFile(
          file as unknown as File
        )) as UploadResponse;

        user.avatar = {
          url: url,
          public_id: publicId
        };
        for (const [key, value] of Object.entries(user.avatar)) {
          modifiedUpdatedData[`avatar.${key}`] = value;
        }
      } catch (error: any) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error);
      }
    }
    const result = await User.findByIdAndUpdate({ _id: req.user.userId }, modifiedUpdatedData, {
      new: true,
      runValidators: true
    });

    return result;
  } catch (error: any) {
    console.log(error);

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not registered yet');
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });

  return result;
};

const changeUserRole = async (id: string, payload: { role: string }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not registered yet');
  }
  if (user.status === 'blocked' || user.status === 'inactive') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked or inactive');
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });

  return result;
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const studentSearchableFields = [
    'email',
    'name',
    'phone',
    'address.city',
    'address.country',
    'address.state'
  ];

  const studentQuery = new QueryBuilder(
    User.find({
      isDeleted: false
    }),
    query
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await studentQuery.countTotal();
  const result = await studentQuery.queryModel;

  return {
    meta,
    result
  };
};

const getUserById = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
  }
  return user;
};

const getProlfile = async (userData: JwtPayload) => {
  const user = await User.findOne({ _id: userData.userId, isDeleted: false }).populate([
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
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
  }
  return user;
};

const deleteUser = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }

  await User.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    {
      new: true
    }
  );
  return null;
};

const addProductToWishlist = async (req: Request) => {
  const userId = req.user.userId;
  const { productId, action } = req.body;
  try {
    if (action === 'remove') {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
      }
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
      }

      if (!user.wishlist.includes(product._id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This product is not in wishlist');
      }

      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { wishlist: product._id }
        },
        {
          new: true
        }
      );

      return 'Product removed from wishlist successfully';
    }

    if (action === 'add') {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
      }

      if (user.wishlist.includes(product._id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This product is already in wishlist');
      }

      await User.findByIdAndUpdate(
        userId,
        {
          $push: { wishlist: product._id }
        },
        {
          new: true
        }
      );
    }

    return 'Product added to wishlist successfully';
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const createUserByAdmin = async (userData: {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'User already exists with this email');
    }

    // Create new user
    const newUser = await User.create({
      ...userData,
      status: 'active',
      isDeleted: false
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to create user'
    );
  }
};

const updateUserByAdmin = async (
  userId: string,
  updateData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  }
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        throw new AppError(httpStatus.CONFLICT, 'Email already exists');
      }
    }

    const result = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    return result;
  } catch (error: any) {
    throw new AppError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to update user'
    );
  }
};

export const userService = {
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
