import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';

const productBrandOptions: ToObjectOptions = {
  virtuals: true,
  transform: function (doc, model) {
    delete model._id;
    return model;
  },
};

@Schema({
  versionKey: false,
  toJSON: productBrandOptions,
})
export class ProductBrand {
  @Prop({ required: true, type: 'String', unique: true })
  brandName: string;

  @Prop({ required: true, type: 'String' })
  brandCountry: string;

  id?: string;
}

export const ProductBrandSchema: mongoose.Schema<ProductBrand> =
  SchemaFactory.createForClass(ProductBrand);
export type ProductBrandDocument = ProductBrand & Document;
