import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';
import { BodyTypes } from '../model/enums/body-types.enum';
import { EngineTypes } from '../model/enums/engine-types.enum';
import { DriveTypes } from '../model/enums/drive-types.enum';
import { TransmissionTypes } from '../model/enums/transmission-types.enum';

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
    max: 8,
    min: 1,
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
