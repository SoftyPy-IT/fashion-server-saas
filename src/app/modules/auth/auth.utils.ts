import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { IUser } from '../user/user.interface';
import config from '../../config';
import AppError from '../../errors/AppError';

export interface IVerificationToken {
  code: string;
  user: IUser;
}

export interface ICreateEmailVerificationToken {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const createEmailVerificationToken = (payload: ICreateEmailVerificationToken) => {
  try {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // create token
    const token = jwt.sign({ code, user: payload }, config.EMAILACTIVATION_SECRET as string, {
      expiresIn: '10m'
    });
    return {
      code,
      token
    };
  } catch (error: any) {
    throw new AppError(500, error.message || 'Something went wrong');
  }
};

export const verifyEmailVerificationToken = (token: string) => {
  try {
    const decodedToken = jwt.verify(
      token,
      config.EMAILACTIVATION_SECRET as string
    ) as IVerificationToken;
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const createToken = (
  payload: { userId: string; role: string },
  secret: Secret,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: `${expiresIn}`
  });

  return token;
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token.toString(), secret.toString()) as JwtPayload;
};
