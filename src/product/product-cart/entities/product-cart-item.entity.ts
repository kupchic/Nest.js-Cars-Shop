import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min } from 'class-validator';

export class ProductCartItemEntity {
  @ApiProperty({ description: 'Product mongoId' })
  @IsMongoId()
  product: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
