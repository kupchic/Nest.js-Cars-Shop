import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas';
import {
  ProductModel,
  ProductModelSchema,
} from './schemas/product-model.schema';
import { ProductModelService } from './services/product-model.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      {
        name: ProductModel.name,
        schema: ProductModelSchema,
      },
    ]),
  ],
  providers: [ProductService, ProductModelService],
  controllers: [ProductController],
})
export class ProductModule {}
