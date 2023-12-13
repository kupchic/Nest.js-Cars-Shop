import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderModel } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/schemas';
import { MailService } from '../mail/mail.service';
import { ModelName, PRODUCT_POPULATE_OPTIONS } from '../common/model';
import { ApproveDeclineOrderDto } from './dto/approve-decline-order.dto';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(ModelName.ORDER)
    private orderModel: OrderModel,
    private mailService: MailService,
    private ordersGateway: OrdersGateway,
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
        .exec();

      await this.mailService.orderNotice(user, order.toJSON(), true);
    }
    return order;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  async findAllMy(user: string): Promise<Order[]> {
    return this.orderModel.find({ user }).exec();
  }

  async findOneMy(user: string, id): Promise<Order> {
    return this.orderModel.findOne({ user, _id: id }).exec();
  }

  async approveDecline(
    id: string,
    user: User,
    status: ApproveDeclineOrderDto,
  ): Promise<Order> {
    const order: Order = await this.orderModel
      .findOneAndUpdate(
        { user, _id: id },
        { status: status.status },
        { new: true },
      )
      .exec();
    if (order) {
      await this.mailService.orderNotice(user, order.toJSON());
      this.ordersGateway.emitOrderApproveDecline(order);
      return order;
    }
  }
}
