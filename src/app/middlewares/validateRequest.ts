import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodOptional, ZodTypeAny } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = <T extends ZodTypeAny>(schema: AnyZodObject | ZodOptional<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync(req.body);
    next();
  });
};

export default validateRequest;
