import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';
import { ProductModel } from './product-model.schema';
import { BodyTypes } from '../model/enums/body-types.enum';
import { EngineTypes } from '../model/enums/engine-types.enum';
import { DriveTypes } from '../model/enums/drive-types.enum';
import { TransmissionTypes } from '../model/enums/transmission-types.enum';
import { ProductColors } from '../model/enums/product-colors.enum';

const carOptions: ToObjectOptions = {
  versionKey: false,
  virtuals: true,
  getters: true,
  transform: function (doc, car) {
    delete car._id;
    return car;
  },
};

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: carOptions,
})
export class Product {
  @Prop({ required: true, type: 'String' })
  carBrand: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductModel.name,
    get(v: ProductModel): string {
      return v.name;
    },
  })
  carModel: ProductModel;

  @Prop({ required: true, type: 'String' })
  brandCountry: string;

  @Prop({ required: true, enum: BodyTypes })
  bodyType: string;

  @Prop({
    required: true,
    type: 'Number',
    max: [
      new Date().getFullYear(),
      'yearOfIssue cant be greater than current year',
    ],
  })
  yearOfIssue: number;

  @Prop({ required: true, enum: EngineTypes })
  engineType: string;

  @Prop({
    required: true,
    type: 'Number',
    set: (v: number) => +v.toFixed(1),
    max: 8,
    min: 1,
  })
  engineSize: number;

  @Prop({ required: true, enum: DriveTypes })
  drive: string;

  @Prop({ required: true, enum: TransmissionTypes })
  transmissionType: string;

  @Prop({ required: true, enum: ProductColors })
  color: string;

  @Prop({ required: true, type: 'Number' })
  price: number;

  @Prop({ required: true, type: 'Number', min: 10, max: 100 })
  warranty: number;

  @Prop({ required: false, type: 'String' })
  description: string;

  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ProductSchema: mongoose.Schema<Product> =
  SchemaFactory.createForClass(Product);
export type ProductDocument = Product & Document;
