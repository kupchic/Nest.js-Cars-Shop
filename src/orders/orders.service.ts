import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, ORDER_MODEL, OrderModel } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(ORDER_MODEL)
    private orderModel: OrderModel,
  ) {}
  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    return this.orderModel.create({
      products: createOrderDto.products,
      user: userId,
    });
  }

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findById(id);
  }

  async findByUserId(user: string): Promise<Order> {
    return this.orderModel.findOne({ user });
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return;
  }
}
