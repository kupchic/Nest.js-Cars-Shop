import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductCartService } from './product-cart.service';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import { UpdateProductCartDto } from './dto/update-product-cart.dto';

@Controller('product-cart')
export class ProductCartController {
  constructor(private readonly productCartService: ProductCartService) {}

  @Post()
  create(@Body() createProductCartDto: CreateProductCartDto): any {
    return this.productCartService.create(createProductCartDto);
  }

  @Get()
  findAll(): any {
    return this.productCartService.findAll();
  }
  s;

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.productCartService.findOne();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductCartDto: UpdateProductCartDto,
  ): any {
    return this.productCartService.update(+id, updateProductCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): any {
    return this.productCartService.remove(+id);
  }
}
