import { Schema, Model, model } from 'mongoose';
import { ISupplier, ISupplierModel } from './supplier.interface';

const supplierSchema = new Schema<ISupplier, ISupplierModel>(
  {
    company: { type: String, required: true },
    name: { type: String, required: true },
    vatNumber: { type: String },
    gstNumber: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

const Supplier: Model<ISupplier> = model<ISupplier, ISupplierModel>('Supplier', supplierSchema);

export default Supplier;
