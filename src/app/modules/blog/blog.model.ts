import { Schema, model } from 'mongoose';
import { IBlog, IBlogModel } from './blog.interface';

const blogSchema = new Schema<IBlog, IBlogModel>(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Blog = model<IBlog, IBlogModel>('Blog', blogSchema);
export default Blog;
