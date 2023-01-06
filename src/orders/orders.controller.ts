import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';
import { GetCurrentUser, Roles } from '../common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import { User } from '../user/schemas';

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
  findMy(@GetCurrentUser('id') userId: string): Promise<Order[]> {
    return this.ordersService.findByUserId(userId);
  }

  @ApiResponse({
    type: OrderEntity,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @ApiResponse({
    type: OrderEntity,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }
}
