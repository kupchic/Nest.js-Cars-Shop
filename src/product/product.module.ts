import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Product,
  ProductBrand,
  ProductBrandSchema,
  ProductModel,
  ProductModelSchema,
  ProductSchema,
} from './schemas';
import { ProductModelService } from './product-model/product-model.service';
import { ProductBrandService } from './product-brand/product-brand.service';
import { ProductBrandController } from './product-brand/product-brand.controller';
import { ProductModelController } from './product-model/product-model.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      {
        name: ProductModel.name,
        schema: ProductModelSchema,
      },
      {
        name: ProductBrand.name,
        schema: ProductBrandSchema,
      },
    ]),
  ],
  providers: [ProductService, ProductModelService, ProductBrandService],
  controllers: [
    ProductBrandController,
    ProductModelController,
    ProductController,
  ],
})
export class ProductModule {}
