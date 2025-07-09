import { Request } from 'express';
import httpStatus from 'http-status';
import Storefront from './storefront.model';
import { IStorefront, ISlider } from './storefront.interface';
import AppError from '../../errors/AppError';

export const getAllStorefront = async (): Promise<IStorefront | null> => {
  try {
    const result = await Storefront.findOne();
    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Storefront not found');
    }
    result.sliders.sort((a, b) => a.order - b.order);

    return result;
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};

export const updateStorefront = async (id: string, req: Request): Promise<IStorefront | null> => {
  try {
    const storefront = await Storefront.findById(id);
    if (!storefront) {
      throw new AppError(httpStatus.NOT_FOUND, 'This storefront does not exist');
    }

    const updatedStorefront = await Storefront.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return updatedStorefront;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

export const manageSliders = async (id: string, req: Request): Promise<IStorefront | null> => {
  try {
    const storefront = await Storefront.findById(id);
    if (!storefront) {
      throw new AppError(httpStatus.NOT_FOUND, 'This storefront does not exist');
    }

    const { sliders } = req.body;

    if (sliders && Array.isArray(sliders)) {
      // Clear existing sliders
      storefront.sliders = [];

      // Add new sliders
      sliders.forEach((slider: ISlider) => {
        storefront?.sliders.push(slider);
      });
    }

    const updatedStorefront = await storefront.save();
    return updatedStorefront;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};
export const storefrontService = {
  getAllStorefront,
  updateStorefront,
  manageSliders
};
