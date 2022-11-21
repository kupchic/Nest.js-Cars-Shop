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
import { ProductBrand } from '../schemas';
import { ProductService } from '../product.service';
import { ProductModelService } from '../product-model/product-model.service';
import { ProductBrandService } from './product-brand.service';
import { MongoIdStringPipe } from '../../common/pipes';
import { Roles } from '../../common/decorators';
import { UserRoles } from '../../user/model/enum/user-roles.enum';
import { CreateProductBrandDto, UpdateProductBrandDto } from '../dto';
import { IProductBrand } from '../model';

@ApiTags('Product Brand Module')
@Controller('products/brands')
export class ProductBrandController {
  constructor(
    private productService: ProductService,
    private productModelsService: ProductModelService,
    private productBrandService: ProductBrandService,
  ) {}

  @ApiResponse({
    type: IProductBrand,
    isArray: true,
  })
  @Get()
  getAllBrands(): Promise<ProductBrand[]> {
    return this.productBrandService.getAllBrands();
  }

  @ApiResponse({
    type: IProductBrand,
  })
  @Get(':id')
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
    type: IProductBrand,
  })
  @Roles(UserRoles.MANAGER)
  @Post()
  createBrand(@Body() createDto: CreateProductBrandDto): Promise<ProductBrand> {
    return this.productBrandService.create(createDto);
  }

  @ApiResponse({
    type: IProductBrand,
  })
  @Roles(UserRoles.MANAGER)
  @Put(':id')
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
  @Delete(':id')
  async deleteBrand(@Param('id', MongoIdStringPipe) id: string): Promise<void> {
    const brand: ProductBrand = await this.productService.deleteProductBrand(
      id,
    );
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
  }
}
