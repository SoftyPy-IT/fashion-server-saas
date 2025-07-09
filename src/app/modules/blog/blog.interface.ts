import { Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  content: string;
  category: string;
}

export interface IBlogModel extends Model<IBlog> {
  // Define model methods here
}
