import { Document, Model } from 'mongoose';

export enum SectionType {
  Product = 'product',
  Banner = 'banner'
}

export enum SectionStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export enum SectionStyle {
  Grid = 'grid',
  Carousel = 'carousel'
}

export interface IImage {
  desktop: {
    url: string;
    link: string;
  }[];
  mobile: {
    url: string;
    link: string;
  }[];
}

export interface ISection extends Document {
  title: string;
  subTitle: string;
  description: string;
  images: IImage;
  products: string[];
  type: SectionType;
  status: SectionStatus;
  style: SectionStyle;
  row: number;
}

export interface ISectionModel extends Model<ISection> {
  // Define model methods here
}
