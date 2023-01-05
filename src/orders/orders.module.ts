import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ORDER_MODEL, OrderSchema } from './schemas/order.schema';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    MongooseModule.forFeature([{ name: ORDER_MODEL, schema: OrderSchema }]),
  ],
})
export class OrdersModule {}
