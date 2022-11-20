import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';

const productBrandOptions: ToObjectOptions = {
  virtuals: true,
  transform: function (doc, model) {
    delete model._id;
    return model;
  },
};

export const PRODUCT_BRANDS_COLLECTION_NAME: string = 'productBrandsCollection';

@Schema({
  collection: PRODUCT_BRANDS_COLLECTION_NAME,
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
