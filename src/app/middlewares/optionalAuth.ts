import { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import config from '../config';
import User from '../modules/user/user.model';
import { TUserRole } from '../modules/user/user.interface';
import { verifyToken } from '../modules/auth/auth.utils';

const optionalAuth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // If no token is provided, continue as guest
    if (!token) {
      req.user = null as unknown as JwtPayload;
      return next();
    }

    try {
      const decoded = verifyToken(token, config.JWT_SECRET as string) as JwtPayload;
      const { userId, role } = decoded;

      const user = await User.findById(userId);

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'This user does not exist');
      }

      const userStatus = user?.status;
      if (userStatus === 'inactive' || userStatus === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is inactive or blocked');
      }

      if (requiredRoles && !requiredRoles.includes(role)) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have permission to perform this action'
        );
      }

      req.user = decoded as JwtPayload;
      next();
    } catch (error) {
      req.user = null as unknown as JwtPayload;
      next();
    }
  });
};

export default optionalAuth;
