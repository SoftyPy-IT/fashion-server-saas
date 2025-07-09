import { Schema, model } from 'mongoose';
import { ICustomers, ICustomersModel } from './Customers.interface';

const CustomersSchema = new Schema<ICustomers, ICustomersModel>(
  {
    company: { type: String, required: true },
    name: { type: String, required: true },
    vatNumber: { type: String },
    gstNumber: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

const Customers = model<ICustomers, ICustomersModel>('Customers', CustomersSchema);
export default Customers;
