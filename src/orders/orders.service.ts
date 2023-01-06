import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderModel } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/schemas';
import { MailService } from '../mail/mail.service';
import { ModelName, PRODUCT_POPULATE_OPTIONS } from '../common/model';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(ModelName.ORDER)
    private orderModel: OrderModel,
    private mailService: MailService,
  ) {}
  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    let order: Order = await this.orderModel.create({
      products: createOrderDto.products,
      user: user.id,
    });
    if (order) {
      order = await this.orderModel
        .findById(order.id)
        .populate({
          path: 'products.product',
          populate: PRODUCT_POPULATE_OPTIONS,
        })
        .lean();
      await this.mailService.sendCreatedOrder(user, order);
    }
    return order;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findById(id);
  }

  async findByUserId(user: string): Promise<Order[]> {
    return this.orderModel.find({ user });
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return;
  }
}
