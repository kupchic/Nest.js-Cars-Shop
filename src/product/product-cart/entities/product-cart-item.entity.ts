import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Max, Min } from 'class-validator';
import { PRODUCT_CART_ITEM_QUANTITY_LIMIT } from '../../model/consts/product-cart-item-quantity-limit';
import { IProduct } from '../../model';

export class ProductCartItemEntity {
  @ApiProperty({ description: 'Product mongoId', type: IProduct })
  @IsMongoId()
  product: string;

  @ApiProperty({ minimum: 1, maximum: PRODUCT_CART_ITEM_QUANTITY_LIMIT })
  @IsNumber()
  @Min(1)
  @Max(PRODUCT_CART_ITEM_QUANTITY_LIMIT)
  quantity: number;
}
