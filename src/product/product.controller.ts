import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Public } from '../common/decorators';
import { CreateCarDto } from './dto/create-car.dto';
import { Car } from './schemas';

@ApiTags('Product Module')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Public()
  @Get('all')
  getAll(): Promise<any> {
    return this.productService.getAll();
  }

  @Public()
  @Post('create')
  create(@Body() createDto: CreateCarDto): Promise<Car> {
    return this.productService.create(createDto);
  }
}
