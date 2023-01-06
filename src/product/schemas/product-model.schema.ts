import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';
import {
  BodyTypes,
  DriveTypes,
  EngineTypes,
  PRODUCT_ENGINE_SIZE_MAX_VALUE,
  PRODUCT_ENGINE_SIZE_MIN_VALUE,
  TransmissionTypes,
} from '../model';
import { CollectionsName } from '../../common/model';

const productModelOptions: ToObjectOptions = {
  virtuals: true,
  transform: function (doc, model) {
    delete model._id;
    return model;
  },
};

@Schema({
  collection: CollectionsName.PRODUCTS_MODELS,
  versionKey: false,
  toJSON: productModelOptions,
})
export class ProductModel {
  @Prop({ required: true, type: 'String', unique: true })
  modelName: string;

  @Prop({ required: true, enum: BodyTypes })
  bodyType: string;

  @Prop({ required: true, enum: EngineTypes })
  engineType: string;

  @Prop({
    required: true,
    type: 'Number',
    set: (v: number) => +v.toFixed(1),
    max: PRODUCT_ENGINE_SIZE_MAX_VALUE,
    min: PRODUCT_ENGINE_SIZE_MIN_VALUE,
  })
  engineSize: number;

  @Prop({ required: true, enum: DriveTypes })
  drive: string;

  @Prop({ required: true, enum: TransmissionTypes })
  transmissionType: string;

  id?: string;
}

export const ProductModelSchema: mongoose.Schema<ProductModel> =
  SchemaFactory.createForClass(ProductModel);
export type ProductModelDocument = ProductModel & Document;
