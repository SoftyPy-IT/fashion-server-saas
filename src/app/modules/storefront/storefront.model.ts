import { Schema, Types, model } from 'mongoose';
import { ISlider, IStorefront, IStorefrontModel } from './storefront.interface';

// Slider Schema
const sliderSchema = new Schema<ISlider>(
  {
    image: {
      mobile: {
        type: String,
        required: true
      },
      desktop: {
        type: String,
        required: true
      }
    },
    title: {
      type: String
    },
    subTitle: {
      type: String
    },
    link: {
      type: String
    },
    order: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Storefront Schema
const storefrontSchema = new Schema<IStorefront, IStorefrontModel>(
  {
    shopName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    contact: {
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },
    socialMedia: {
      facebook: {
        type: String,
        required: true
      },
      twitter: {
        type: String
      },
      instagram: {
        type: String
      },
      linkedin: {
        type: String
      },
      youtube: {
        type: String
      }
    },
    pages: {
      aboutUs: {
        type: String,
        required: true
      },
      termsAndConditions: {
        type: String,
        required: true
      },
      privacyPolicy: {
        type: String,
        required: true
      },
      refundPolicy: {
        type: String,
        required: true
      }
    },
    faq: [
      {
        question: {
          type: String,
          required: true
        },
        answer: {
          type: String,
          required: true
        }
      }
    ],
    logo: {
      type: String,
      required: true
    },
    sliders: [sliderSchema]
  },
  {
    timestamps: true
  }
);

// Storefront Model
const Storefront = model<IStorefront, IStorefrontModel>('Storefront', storefrontSchema);

export default Storefront;
