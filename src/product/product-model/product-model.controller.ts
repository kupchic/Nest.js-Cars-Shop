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
import { ProductModel } from '../schemas';
import { ProductService } from '../product.service';
import { ProductModelService } from './product-model.service';
import { MongoIdStringPipe } from '../../common/pipes';
import { Roles } from '../../common/decorators';
import { UserRoles } from '../../user/model/enum/user-roles.enum';
import { UpdateProductModelDto } from '../dto/update-product-model.dto';
import { CreateProductModelDto } from '../dto';

@ApiTags('Product Models Module')
@Controller('products/models')
export class ProductModelController {
  constructor(
    private productService: ProductService,
    private productModelsService: ProductModelService,
  ) {}

  @ApiResponse({
    type: ProductModel,
    isArray: true,
  })
  @Get('')
  getAllModels(): Promise<ProductModel[]> {
    return this.productModelsService.getAllModels();
  }

  @ApiResponse({
    type: ProductModel,
  })
  @Get(':id')
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
  @Roles(UserRoles.ADMIN)
  @Post('')
  createModel(@Body() createDto: CreateProductModelDto): Promise<ProductModel> {
    return this.productModelsService.create(createDto);
  }

  @ApiResponse({
    type: ProductModel,
  })
  @Roles(UserRoles.MANAGER)
  @Put(':id')
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
  @Delete(':id')
  async deleteModel(@Param('id', MongoIdStringPipe) id: string): Promise<void> {
    const model: ProductModel = await this.productService.deleteProductModel(
      id,
    );
    if (!model) {
      throw new NotFoundException('Model not found');
    }
  }
}
