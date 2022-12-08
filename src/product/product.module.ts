import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PRODUCT_BRANDS_COLLECTION_NAME,
  PRODUCT_MODELS_COLLECTION_NAME,
  ProductBrandSchema,
  ProductModelSchema,
  PRODUCTS_COLLECTION_NAME,
  ProductSchema,
} from './schemas';
import { ProductModelService } from './product-model/product-model.service';
import { ProductBrandService } from './product-brand/product-brand.service';
import { ProductBrandController } from './product-brand/product-brand.controller';
import { ProductModelController } from './product-model/product-model.controller';
import { ProductCartController } from './product-cart/product-cart.controller';
import { ProductCartService } from './product-cart/product-cart.service';
import {
  PRODUCT_CART_COLLECTION_NAME,
  ProductCartSchema,
} from './schemas/product-cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PRODUCTS_COLLECTION_NAME, schema: ProductSchema },
      {
        name: PRODUCT_MODELS_COLLECTION_NAME,
        schema: ProductModelSchema,
      },
      {
        name: PRODUCT_BRANDS_COLLECTION_NAME,
        schema: ProductBrandSchema,
      },
      {
        name: PRODUCT_CART_COLLECTION_NAME,
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
