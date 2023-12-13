import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductBrandSchema,
  ProductCartSchema,
  ProductModelSchema,
  ProductSchema,
} from './schemas';
import { ProductModelService } from './product-model/product-model.service';
import { ProductBrandService } from './product-brand/product-brand.service';
import { ProductBrandController } from './product-brand/product-brand.controller';
import { ProductModelController } from './product-model/product-model.controller';
import { ProductCartController } from './product-cart/product-cart.controller';
import { ProductCartService } from './product-cart/product-cart.service';
import { ModelName } from '../common/model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PRODUCT, schema: ProductSchema },
      {
        name: ModelName.PRODUCT_MODEL,
        schema: ProductModelSchema,
      },
      {
        name: ModelName.PRODUCT_BRAND,
        schema: ProductBrandSchema,
      },
      {
        name: ModelName.PRODUCT_CART,
        schema: ProductCartSchema,
      },
    ]),
  ],
  providers: [
    ProductService,
    ProductModelService,
    ProductBrandService,
    ProductCartService,
  ],
  controllers: [
    ProductBrandController,
    ProductModelController,
    ProductCartController,
    ProductController,
  ],
})
export class ProductModule {}
