import { ApiProperty } from '@nestjs/swagger';
import { ProductCartItemEntity } from '../entities/product-cart-item.entity';
import { IsArray, IsInstance } from 'class-validator';

export class UpdateProductCartDto {
  @ApiProperty({ type: ProductCartItemEntity, isArray: true })
  @IsArray()
  @IsInstance(ProductCartItemEntity, { each: true })
  products: ProductCartItemEntity[];
}
