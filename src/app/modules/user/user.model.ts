import { model, Schema } from 'mongoose';
import { IUser, IUserModel } from './user.interface';
import bcrypt from 'bcrypt';

const userSchema = new Schema<IUser, IUserModel>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {
      type: String,
      required: false
    },
    password: { type: String, required: true, select: 0 },
    avatar: {
      public_id: String,
      url: String
    },
    dateOfBirth: { type: Date },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      required: true,
      default: 'active'
    },
    isVerified: { type: Boolean, default: false },
    passwordChangedAt: {
      type: Date
    },
    address: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },
    hasShippingAddress: { type: Boolean, default: false },
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    paymentHistory: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.comparePassword = async function (
  enteredPassword: string,
  userPassword: string
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

userSchema.statics.isUserExist = async function (email: string) {
  const user = await this.findOne({ email });
  return user ? true : false;
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
