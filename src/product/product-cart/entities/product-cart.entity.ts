import { ApiProperty } from '@nestjs/swagger';
import { ProductCartItemEntity } from './product-cart-item.entity';

export class ProductCartEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: string;

  @ApiProperty({ type: [ProductCartItemEntity] })
  products: ProductCartItemEntity[];

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalSum: number;
}
