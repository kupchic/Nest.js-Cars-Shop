import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Roles } from '../common/decorators';
import { Product } from './schemas';
import { CreateProductDto, ProductFiltersDto, UpdateProductDto } from './dto';
import { MongoIdStringPipe } from '../common/pipes';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';

@ApiTags('Product Module')
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @ApiResponse({
    type: Product,
    isArray: true,
  })
  @Get()
  search(
    @Query() query?: ProductSearchQueryDto | undefined,
    @Body() filters?: ProductFiltersDto | undefined,
  ): Promise<Product[]> {
    return this.productService.search(query, filters);
  }

  @Get(':id')
  async getOne(@Param('id', MongoIdStringPipe) id: string): Promise<Product> {
    const product: Product = await this.productService.getById(id);
    if (!product) {
      throw new NotFoundException('Product not Found');
    }
    return product;
  }

  @ApiResponse({
    type: Product,
  })
  @Roles(UserRoles.ADMIN)
  @Post('create')
  create(@Body() createDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createDto);
  }

  @ApiResponse({
    type: Product,
  })
  @Roles(UserRoles.ADMIN)
  @Put(':id')
  updateProduct(
    @Param('id', MongoIdStringPipe) id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateProduct(id, updateDto);
  }

  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id', MongoIdStringPipe) id: string): Promise<void> {
    const product: Product = await this.productService.deleteProduct(id);
    if (!product) {
      throw new NotFoundException('Product not Found');
    }
  }
}
