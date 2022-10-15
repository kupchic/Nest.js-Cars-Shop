import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductDto } from './dto/product.dto';

@ApiTags('Product Module')
@Controller('product')
export class ProductController {
  @Get('all')
  getAll(): ProductDto[] {
    return [];
  }
}
