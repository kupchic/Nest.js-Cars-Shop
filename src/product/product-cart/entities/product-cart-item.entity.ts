import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export class ProductCartItem {
  @ApiProperty({ description: 'Product mongoId' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, unique: true })
  productId: string;

  @ApiProperty()
  @Prop({ type: 'Number', min: 0 })
  quantity: number;
}
