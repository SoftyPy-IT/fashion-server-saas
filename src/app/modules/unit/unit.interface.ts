import { Document, Model, ObjectId } from 'mongoose';

type Operator = '*' | '/' | '+' | '-';

export interface IUnit extends Document {
  unit_code: string;
  name: string;
  base_unit: ObjectId;
  operator: Operator;
  operation_value: number;
  isDeleted: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnitModel extends Model<IUnit> {}
