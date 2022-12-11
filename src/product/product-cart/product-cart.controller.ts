import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ProductCartService } from './product-cart.service';
import { UpdateProductCartDto } from './dto/update-product-cart.dto';
import { GetCurrentUser, Roles } from '../../common/decorators';
import { User } from '../../user/schemas';
import { UserRoles } from '../../user/model/enum/user-roles.enum';
import { MongoIdStringPipe } from '../../common/pipes';
import { ProductCart } from '../schemas/product-cart.schema';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductCartEntity } from './entities/product-cart.entity';

@ApiTags('Product Cart Module')
@Controller('products/carts')
export class ProductCartController {
  constructor(private readonly productCartService: ProductCartService) {}

  @ApiResponse({
    type: ProductCartEntity,
    isArray: true,
  })
  @Roles(UserRoles.ADMIN)
  @Get()
  findAll(): Promise<ProductCart[]> {
    return this.productCartService.findAll();
  }

  @ApiResponse({
    type: ProductCartEntity,
  })
  @Get('my')
  getCurrentUserCart(@GetCurrentUser() user: User): Promise<ProductCart> {
    return this.productCartService.findOne(user.cart);
  }

  @ApiResponse({
    type: ProductCartEntity,
  })
  @Put('my')
  updateMyCart(
    @GetCurrentUser() user: User,
    @Body() updateProductCartDto: UpdateProductCartDto,
  ): Promise<ProductCart> {
    return this.productCartService.update(user.cart, updateProductCartDto);
  }

  @ApiResponse({
    type: ProductCartEntity,
  })
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  findOne(@Param('id', MongoIdStringPipe) id: string): Promise<ProductCart> {
    return this.productCartService.findOne(id);
  }

  @ApiResponse({
    type: ProductCartEntity,
  })
  @Roles(UserRoles.ADMIN)
  @Put(':id')
  update(
    @Param('id', MongoIdStringPipe) id: string,
    @Body() updateProductCartDto: UpdateProductCartDto,
  ): Promise<ProductCart> {
    return this.productCartService.update(id, updateProductCartDto);
  }
}
