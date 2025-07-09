import { Schema, Types, model } from 'mongoose';
import {
  ISection,
  ISectionModel,
  SectionStatus,
  SectionStyle,
  SectionType
} from './section.interface';

const imageSchema = new Schema(
  {
    desktop: {
      type: [
        {
          url: { type: String, required: true },
          link: { type: String, required: true }
        }
      ],
      required: false
    },
    mobile: {
      type: [
        {
          url: { type: String, required: true },
          link: { type: String, required: true }
        }
      ],
      required: false
    }
  },
  { _id: false }
);

const sectionSchema = new Schema<ISection, ISectionModel>(
  {
    title: { type: String, required: false },
    subTitle: { type: String, required: false },
    description: { type: String, required: false },
    images: { type: imageSchema, required: false },
    products: [{ type: Types.ObjectId, ref: 'Product', required: false }],
    status: { type: String, enum: SectionStatus, default: SectionStatus.Active },
    type: { type: String, enum: SectionType, required: true },
    style: { type: String, enum: SectionStyle, default: SectionStyle.Grid },
    row: { type: Number, default: 4 }
  },
  {
    timestamps: true
  }
);

const Section = model<ISection, ISectionModel>('Section', sectionSchema);
export default Section;
