import { ApiProperty } from '@nestjs/swagger';
import { ProductCartEntity } from '../../product/product-cart/entities/product-cart.entity';
import { OrderStatus } from '../model/enums/order-status';

export class OrderEntity extends ProductCartEntity {
  @ApiProperty()
  orderNo: number;

  @ApiProperty({ enum: OrderStatus })
  status?: OrderStatus;

  @ApiProperty()
  createdAt?: string;

  @ApiProperty()
  updatedAt?: string;
}
