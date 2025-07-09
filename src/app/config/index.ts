import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

  RESET_PASS_LINK: process.env.RESET_PASS_LINK,
  CROSS_ORIGIN: process.env.CROSS_ORIGIN,
  CROSS_ORIGIN_ADMIN: process.env.CROSS_ORIGIN_ADMIN,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_CLOUD_KEY: process.env.CLOUDINARY_CLOUD_KEY,
  CLOUDINARY_CLOUD_SECRET: process.env.CLOUDINARY_CLOUD_SECRET,

  EMAILACTIVATION_SECRET: process.env.EMAILACTIVATION_SECRET,

  SMTPHOST: process.env.SMTPHOST,
  SMTPPORT: process.env.SMTPPORT,
  SMTPUSER: process.env.SMTPUSER,
  SMTPPASS: process.env.SMTPPASS,
  SUPPORTEMAIl: process.env.SUPPORTEMAIl,
  FROMNAME: process.env.FROMNAME,
  FROMEMAIL: process.env.FROMEMAIL,

  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  DATABASE_URL_A: process.env.DATABASE_URL_A,
  DATABASE_URL_B: process.env.DATABASE_URL_B,
  IMAGE_SERVER_API_KEY: process.env.IMAGE_SERVER_API_KEY
};
