import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';

const productModelOptions: ToObjectOptions = {
  virtuals: true,
  transform: function (doc, model) {
    delete model._id;
    return model;
  },
};

@Schema({
  versionKey: false,
  toJSON: productModelOptions,
})
export class ProductModel {
  @Prop({ required: true, type: 'String' })
  name: string;
  id?: string;
}

export const ProductModelSchema: mongoose.Schema<ProductModel> =
  SchemaFactory.createForClass(ProductModel);
export type ProductModelDocument = ProductModel & Document;
