import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';
import { GetCurrentUser, Roles } from '../common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import { User } from '../user/schemas';
import { MongoIdStringPipe } from '../common/pipes';
import { ApproveDeclineOrderDto } from './dto/approve-decline-order.dto';

@ApiTags('Orders Module')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiResponse({
    type: OrderEntity,
  })
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetCurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.create(createOrderDto, user);
  }

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @ApiResponse({
    type: [OrderEntity],
  })
  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @ApiResponse({
    type: [OrderEntity],
  })
  @Get('my')
  findAllMy(@GetCurrentUser('id') userId: string): Promise<Order[]> {
    return this.ordersService.findAllMy(userId);
  }

  @ApiResponse({
    type: OrderEntity,
  })
  @Get('my/:id')
  async findOneMy(
    @GetCurrentUser('id') userId: string,
    @Param('id', MongoIdStringPipe) id: string,
  ): Promise<Order> {
    const order: Order = await this.ordersService.findOneMy(userId, id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @ApiResponse({
    type: OrderEntity,
  })
  @Get(':id')
  async findOne(@Param('id', MongoIdStringPipe) id: string): Promise<Order> {
    const order: Order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @ApiResponse({
    type: OrderEntity,
  })
  @Patch(':id')
  async approveDecline(
    @GetCurrentUser() user: User,
    @Param('id', MongoIdStringPipe) id: string,
    @Body() dto: ApproveDeclineOrderDto,
  ): Promise<Order> {
    const order: Order = await this.ordersService.approveDecline(id, user, dto);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
