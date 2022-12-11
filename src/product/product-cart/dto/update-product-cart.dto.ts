import { ApiProperty } from '@nestjs/swagger';
import { ProductCartItemEntity } from '../entities/product-cart-item.entity';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ArrayDistinct } from '../../../common/validators';
import {
  PRODUCT_CART_SIZE_LIMIT,
  PRODUCT_CART_SIZE_LIMIT_ERROR,
} from '../../model/consts/product-cart-size-limit';

export class UpdateProductCartDto {
  @ApiProperty({ type: ProductCartItemEntity, isArray: true })
  @IsArray()
  @ArrayMaxSize(PRODUCT_CART_SIZE_LIMIT, {
    message: PRODUCT_CART_SIZE_LIMIT_ERROR,
  })
  @ArrayDistinct('product')
  @ValidateNested({ each: true })
  @Type(() => ProductCartItemEntity)
  products: ProductCartItemEntity[];
}
