import { OrdersController } from '../orders.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { Order, OrderSchema } from './order.schema';
import mongoose from 'mongoose';

describe('OrdersController', () => {
  let schema: mongoose.Schema<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [],
    }).compile();

    schema = OrderSchema;
  });

  it('should be defined', () => {
    expect(schema).toBeDefined();
  });
});
