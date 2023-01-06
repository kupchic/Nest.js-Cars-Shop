import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './schemas/order.schema';
import { MailService } from '../mail/mail.service';
import { ModelName } from '../common/model';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, MailService],
  imports: [
    MongooseModule.forFeature([{ name: ModelName.ORDER, schema: OrderSchema }]),
  ],
})
export class OrdersModule {}
