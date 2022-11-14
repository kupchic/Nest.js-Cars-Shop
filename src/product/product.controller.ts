import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './services/product.service';
import { Roles } from '../common/decorators';
import { Product, ProductBrand, ProductModel } from './schemas';
import {
  CreateProductBrandDto,
  CreateProductDto,
  CreateProductModelDto,
  UpdateProductBrandDto,
  UpdateProductDto,
} from './dto';
import { ProductModelService } from './services/product-model.service';
import { MongoIdStringPipe } from '../common/pipes';
import { ProductBrandService } from './services/product-brand.service';
import { UpdateProductModelDto } from './dto/update-product-model.dto';
import { UserRoles } from '../user/model/enum/user-roles.enum';

@ApiTags('Product Module')
@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private productModelsService: ProductModelService,
    private productBrandService: ProductBrandService,
  ) {}

  @ApiResponse({
    type: Product,
    isArray: true,
  })
  @Get()
  getAll(): Promise<Product[]> {
    return this.productService.getAllProducts();
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

  @ApiResponse({
    type: ProductModel,
    isArray: true,
  })
  @Get('models')
  getAllModels(): Promise<ProductModel[]> {
    return this.productModelsService.getAllModels();
  }

  @ApiResponse({
    type: ProductBrand,
    isArray: true,
  })
  @Get('brands')
  getAllBrands(): Promise<ProductBrand[]> {
    return this.productBrandService.getAllBrands();
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
    type: ProductModel,
  })
  @Get('models/:id')
  async getModel(
    @Param('id', MongoIdStringPipe) id: string,
  ): Promise<ProductModel> {
    const model: ProductModel = await this.productModelsService.getModel(id);
    if (!model) {
      throw new NotFoundException('Model not found');
    }
    return model;
  }

  @ApiResponse({
    type: ProductModel,
  })
  @Roles(UserRoles.MANAGER)
  @Put('models/:id')
  async updateModel(
    @Param('id', MongoIdStringPipe) id: string,
    @Body() toUpdate: UpdateProductModelDto,
  ): Promise<ProductModel> {
    const model: ProductModel = await this.productModelsService.updateModel(
      id,
      toUpdate,
    );
    if (!model) {
      throw new NotFoundException('Brand not Found');
    }
    return model;
  }

  @Roles(UserRoles.ADMIN)
  @Delete('models/:id')
  async deleteModel(@Param('id', MongoIdStringPipe) id: string): Promise<void> {
    const model: ProductModel = await this.productService.deleteProductModel(
      id,
    );
    if (!model) {
      throw new NotFoundException('Model not found');
    }
  }

  @ApiResponse({
    type: ProductModel,
  })
  @Roles(UserRoles.MANAGER)
  @Post('models/create')
  createModel(@Body() createDto: CreateProductModelDto): Promise<ProductModel> {
    return this.productModelsService.create(createDto);
  }

  @ApiResponse({
    type: ProductBrand,
  })
  @Get('brands/:id')
  async getBrand(
    @Param('id', MongoIdStringPipe) id: string,
  ): Promise<ProductBrand> {
    const brand: ProductBrand = await this.productBrandService.getBrand(id);
    if (!brand) {
      throw new NotFoundException('Product not Found');
    }
    return brand;
  }

  @ApiResponse({
    type: ProductBrand,
  })
  @Roles(UserRoles.MANAGER)
  @Put('brands/:id')
  async updateBrand(
    @Param('id', MongoIdStringPipe) id: string,
    @Body() toUpdate: UpdateProductBrandDto,
  ): Promise<ProductBrand> {
    const brand: ProductBrand = await this.productBrandService.updateBrand(
      id,
      toUpdate,
    );
    if (!brand) {
      throw new NotFoundException('Brand not Found');
    }
    return brand;
  }

  @Roles(UserRoles.ADMIN)
  @Delete('brands/:id')
  async deleteBrand(@Param('id', MongoIdStringPipe) id: string): Promise<void> {
    const brand: ProductBrand = await this.productService.deleteProductBrand(
      id,
    );
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
  }

  @ApiResponse({
    type: ProductBrand,
  })
  @Roles(UserRoles.MANAGER)
  @Post('brands/create')
  createBrand(@Body() createDto: CreateProductBrandDto): Promise<ProductBrand> {
    return this.productBrandService.create(createDto);
  }
}
