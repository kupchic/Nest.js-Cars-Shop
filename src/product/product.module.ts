import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
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
import { ProductModelService } from './services/product-model.service';
import { ProductBrandService } from './services/product-brand.service';

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
  controllers: [ProductController],
})
export class ProductModule {}
