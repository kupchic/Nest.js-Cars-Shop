import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './services/product.service';
import { Public } from '../common/decorators';
import { Product } from './schemas';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductModel } from './schemas/product-model.schema';
import { ProductModelService } from './services/product-model.service';
import { MongoIdStringPipe } from '../common/pipes';

@ApiTags('Product Module')
@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private productModelsService: ProductModelService,
  ) {}

  @ApiResponse({
    type: Product,
    isArray: true,
  })
  @Public() //TODO everywhere
  @Get()
  getAll(): Promise<Product[]> {
    return this.productService.getAllProducts();
  }

  @ApiResponse({
    type: Product,
  })
  @Public()
  @Post('create')
  create(@Body() createDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createDto);
  }

  @Public()
  @Get(':id')
  async getOne(@Param('id', MongoIdStringPipe) id: string): Promise<Product> {
    const product: Product = await this.productService.getById(id);
    if (!product) {
      throw new NotFoundException('Product not Found');
    }
    return product;
  }

  @Public()
  @Delete(':id')
  delete(@Param('id', MongoIdStringPipe) id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }

  @ApiResponse({
    type: ProductModel,
    isArray: true,
  })
  @Public()
  @Get('models')
  getAllModels(): Promise<ProductModel[]> {
    return this.productModelsService.getAllModels();
  }
}
