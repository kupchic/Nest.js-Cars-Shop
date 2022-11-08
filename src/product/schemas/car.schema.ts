import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDecimal, IsInt, IsOptional } from 'class-validator';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Car {
  @Prop()
  carBrand: string;

  @Prop()
  carModel: string;

  @Prop()
  brandCountry: string;

  @Prop()
  bodyType: string;

  @Prop()
  @IsInt()
  yearOfIssue: number;

  @Prop()
  engineType: string;

  @Prop()
  @IsDecimal()
  engineSize: number;

  @Prop()
  drive: string;

  @Prop()
  transmissionType: string;

  @Prop()
  color: string;

  @Prop()
  @IsDecimal()
  price: number;

  @Prop()
  warranty: number;

  @Prop()
  @IsOptional()
  description: string;
}

export const CarSchema: mongoose.Schema<Car> =
  SchemaFactory.createForClass(Car);
export type CarDocument = Car & Document;
