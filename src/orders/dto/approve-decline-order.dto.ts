import { OrderStatus } from '../model/enums/order-status';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ApproveDeclineOrderDto {
  @ApiProperty({
    pattern: '2|3',
    description: 'OrderStatus.PURCHASED | OrderStatus.DECLINED',
  })
  @IsIn([OrderStatus.PURCHASED, OrderStatus.DECLINED])
  status: OrderStatus.PURCHASED | OrderStatus.DECLINED;
}
