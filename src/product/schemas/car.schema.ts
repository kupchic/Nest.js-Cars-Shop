import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ToObjectOptions } from 'mongoose';

const carOptions: ToObjectOptions = {
  versionKey: false,
  virtuals: true,
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
export class Car {
  @Prop({ required: true, type: 'String' })
  carBrand: string;

  @Prop({ required: true, type: 'String' })
  carModel: string;

  @Prop({ required: true, type: 'String' })
  brandCountry: string;

  @Prop({ required: true, type: 'String' })
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

  @Prop({ required: true, type: 'String' })
  engineType: string;

  @Prop({
    required: true,
    type: 'Number',
    set: (v: number) => +v.toFixed(1),
  })
  engineSize: number;

  @Prop({ required: true, type: 'String' })
  drive: string;

  @Prop({ required: true, type: 'String' })
  transmissionType: string;

  @Prop({ required: true, type: 'String' })
  color: string;

  @Prop({ required: true, type: 'Number' })
  price: number;

  @Prop({ required: true, type: 'Number' })
  warranty: number;

  @Prop({ required: false, type: 'String' })
  description: string;

  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CarSchema: mongoose.Schema<Car> =
  SchemaFactory.createForClass(Car);
export type CarDocument = Car & Document;
