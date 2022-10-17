import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Product Module')
@Controller('product')
export class ProductController {
  @Get('all')
  getAll(): any[] {
    return [];
  }
}
