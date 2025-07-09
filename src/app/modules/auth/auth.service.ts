import bcrypt from 'bcrypt';
import { Request } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { emailQueue, emailQueueName } from '../../jobs/EmailJob';
import { renderEjs } from '../../utils/helper';
import Storefront from '../storefront/storefront.model';
import User from '../user/user.model';
import {
  createEmailVerificationToken,
  createToken,
  IVerificationToken,
  verifyEmailVerificationToken,
  verifyToken
} from './auth.utils';

const sendVerificationEmail = async (req: Request) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const payload = {
      firstName,
      lastName,
      email,
      password
    };

    const verificationCode = createEmailVerificationToken(payload);

    const appData = await Storefront.findOne({})
      .select('shopName description contact socialMedia logo')
      .lean();

    const emailData = {
      code: verificationCode.code,
      email: email,
      name: `${firstName} ${lastName}`,
      shopName: appData?.shopName,
      description: appData?.description,
      contact: appData?.contact,
      socialMedia: appData?.socialMedia,
      logo: appData?.logo,
      verificationCode: [
        verificationCode.code[0],
        verificationCode.code[1],
        verificationCode.code[2],
        verificationCode.code[3]
      ],
      url: req.protocol + '://' + req.get('host')
    };

    const html = await renderEjs('email.verification', emailData);

    await emailQueue.add(emailQueueName, {
      to: email,
      subject: 'Verify your email',
      body: html as string
    });

    return {
      token: verificationCode.token
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
  }
};

const userRegistration = async (req: Request) => {
  try {
    const { email } = req.body;

    const isUserExist = await User.isUserExist(email);
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This email is already used');
    }
    // verify email and save user to database
    const { token } = await sendVerificationEmail(req);

    return {
      token
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

const verifyEmail = async (req: Request) => {
  try {
    const { token, code } = req.body;

    // verify token
    const decodedToken: IVerificationToken = verifyEmailVerificationToken(token);

    if (decodedToken.code !== code) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This is an invalid code, please try again');
    }

    const { firstName, lastName, email, password } = decodedToken.user;

    const isUserExist = await User.isUserExist(email);
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This email is already used');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      isVerified: true
    });

    // create token
    const jwtPayload = {
      userId: user._id,
      role: user.role
    };
    const accessToken = createToken(
      jwtPayload,
      config.JWT_SECRET as string,
      config.JWT_EXPIRES_IN as string
    );

    const refreshToekn = createToken(
      jwtPayload,
      config.JWT_REFRESH_SECRET as string,
      config.JWT_REFRESH_EXPIRES_IN as string
    );

    const appData = await Storefront.findOne({})
      .select('shopName description contact socialMedia logo')
      .lean();

    const emailData = {
      email: email,
      name: `${firstName} ${lastName}`,
      shopName: appData?.shopName,
      description: appData?.description,
      contact: appData?.contact,
      socialMedia: appData?.socialMedia,
      logo: appData?.logo,
      url: req.protocol + '://' + req.get('host')
    };

    const html = await renderEjs('email.welcome', emailData);

    await emailQueue.add(emailQueueName, {
      to: email,
      subject: 'Welcome to our platform',
      body: html as string
    });

    return {
      user: {
        ...user.toJSON(),
        password,
        token: accessToken
      },
      accessToken,
      refreshToekn
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

const userLogin = async (req: Request) => {
  try {
    const { email, password } = req.body;

    const isUserExist = await User.isUserExist(email);
    if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You entered an wrong email or password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You entered an wrong email or password');
    }

    const passwordMatch = await User.comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You entered an wrong email or password');
    }

    // create token
    const jwtPayload = {
      userId: user._id,
      role: user.role
    };

    const accessToken = createToken(
      jwtPayload,
      config.JWT_SECRET as Secret,
      config.JWT_EXPIRES_IN as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.JWT_REFRESH_SECRET as Secret,
      config.JWT_REFRESH_EXPIRES_IN as string
    );

    return {
      user: {
        ...user.toJSON(),
        token: accessToken
      },
      accessToken,
      refreshToken
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

const refreshToken = async (req: Request) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Please provide a refresh token');
    }
    const decoded = verifyToken(refreshToken, config.JWT_REFRESH_SECRET as Secret);
    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }

    const { userId } = decoded;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
    }

    const userStatus = user?.status;
    if (userStatus === 'blocked' || userStatus === 'inactive') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked or inactive');
    }

    const jwtPayload = {
      userId: user._id,
      role: user.role
    };

    const newRefreshToken = createToken(
      jwtPayload,
      config.JWT_REFRESH_SECRET as string,
      config.JWT_REFRESH_EXPIRES_IN as string
    );

    const accessToken = createToken(
      jwtPayload,
      config.JWT_SECRET as string,
      config.JWT_EXPIRES_IN as string
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

const forgetPasswordService = async (req: Request, email: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
    }

    const userStatus = user?.status;
    if (userStatus === 'blocked' || userStatus === 'inactive') {
      throw new AppError(httpStatus.FORBIDDEN, 'This is user is blocked or inactive');
    }

    const jwtPayload = {
      userId: user.id,
      role: user.role
    };
    const accessToken = createToken(jwtPayload, config.JWT_SECRET as string, '10m');
    const appData = await Storefront.findOne({})
      .select('shopName description contact socialMedia logo')
      .lean();

    const emailData = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      resetUILink: `${config.RESET_PASS_LINK}?id=${user.id}&token=${accessToken}`,
      supportEmail: config.SUPPORTEMAIl,

      shopName: appData?.shopName,
      description: appData?.description,
      contact: appData?.contact,
      socialMedia: appData?.socialMedia,
      logo: appData?.logo,
      url: req.protocol + '://' + req.get('host')
    };

    const html = await renderEjs('email.forget-password', emailData);

    await emailQueue.add(emailQueueName, {
      to: email,
      subject: 'Reset your password',
      body: html as string
    });
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

const resetPasswordService = async (req: Request, token: string) => {
  try {
    const decoded = verifyToken(token, config.JWT_SECRET as string);

    const payload = {
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword
    };
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This is user is not found');
    }

    const userStatus = user?.status;
    if (userStatus === 'blocked' || userStatus === 'inactive') {
      throw new AppError(httpStatus.FORBIDDEN, 'This is user is blocked or inactive');
    }

    const newHashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await User.findOneAndUpdate(
      {
        _id: user._id,
        role: user.role
      },
      {
        password: newHashedPassword,
        passwordChangedAt: new Date()
      }
    );

    // send email to user for password change confirmation
    const appData = await Storefront.findOne({})
      .select('shopName description contact socialMedia logo')
      .lean();

    const emailData = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      shopName: appData?.shopName,
      description: appData?.description,
      contact: appData?.contact,
      socialMedia: appData?.socialMedia,
      logo: appData?.logo,
      url: req.protocol + '://' + req.get('host')
    };

    const html = await renderEjs('email.password-change-success', emailData);

    await emailQueue.add(emailQueueName, {
      to: user.email,
      subject: 'Password changed successfully',
      body: html as string
    });

    return null;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Something went wrong, please try again'
    );
  }
};

export const authService = {
  userRegistration,
  verifyEmail,
  userLogin,
  refreshToken,
  forgetPasswordService,
  resetPasswordService
};
