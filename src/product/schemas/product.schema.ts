import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';
import { ProductModel } from './product-model.schema';
import { ProductColors } from '../model/enums/product-colors.enum';
import { ProductBrand } from './product-brand.schema';

const carOptions: ToObjectOptions = {
  versionKey: false,
  virtuals: true,
  getters: true,
  transform: function (doc, car) {
    delete car._id;
    return car;
  },
};
export const PRODUCTS_COLLECTION_NAME: string = 'productsCollection';

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: carOptions,
  collection: PRODUCTS_COLLECTION_NAME,
})
export class Product {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductBrand.name,
  })
  productBrand: ProductBrand;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductModel.name,
  })
  productModel: ProductModel;

  @Prop({
    required: true,
    type: 'Number',
    max: [
      new Date().getFullYear(),
      'yearOfIssue cant be greater than current year',
    ],
  })
  yearOfIssue: number;

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
