import { Document, Model, ObjectId } from 'mongoose';

export interface ISlider extends Document {
  image: {
    mobile: string;
    desktop: string;
  };
  title: string;
  subTitle: string;
  link: string;
  order: number;
}
export interface IStorefront extends Document {
  shopName: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialMedia: {
    facebook: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  logo: string;
  pages: {
    aboutUs: string;
    termsAndConditions: string;
    privacyPolicy: string;
    refundPolicy: string;
  };
  faq: {
    question: string;
    answer: string;
  }[];
  sliders: ISlider[];
}

// Storefront Model Interface
export interface IStorefrontModel extends Model<IStorefront> {
  // Define model methods here
}
