import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { USER_MODEL } from '../../user/schemas';
import { ProductCartItemEntity } from '../product-cart/entities/product-cart-item.entity';
import { PRODUCTS_COLLECTION_NAME } from './product.schema';
import {
  PRODUCT_CART_SIZE_LIMIT,
  PRODUCT_CART_SIZE_LIMIT_ERROR,
} from '../model/consts/product-cart-size-limit';
import { PRODUCT_CART_ITEM_QUANTITY_LIMIT } from '../model/consts/product-cart-item-quantity-limit';
import { UpdateProductCartDto } from '../product-cart/dto/update-product-cart.dto';
import { ConflictException } from '@nestjs/common';
import { getProductsTotalSum } from '../../common/utils';
import { PRODUCT_BRANDS_COLLECTION_NAME } from './product-brand.schema';
import { PRODUCT_MODELS_COLLECTION_NAME } from './product-model.schema';

const productCartOptions: ToObjectOptions = {
  virtuals: true,
  transform: function (doc, model) {
    delete model._id;
    return model;
  },
};

export const PRODUCT_CART_COLLECTION_NAME: string = 'productCartCollection';

@Schema({
  collection: PRODUCT_CART_COLLECTION_NAME,
  versionKey: false,
  toJSON: productCartOptions,
  statics: {
    async getTotalSum(productCatItems: ProductCartItemEntity[]) {
      return getProductsTotalSum.call(this, productCatItems);
    },
  },
})
export class ProductCart {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: () => USER_MODEL,
    unique: true,
    immutable: true,
  })
  user: string;

  @Prop({
    required: true,
    type: [
      {
        _id: false, // disable auto creation
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: (): string => PRODUCTS_COLLECTION_NAME,
        },
        quantity: {
          type: 'Number',
          min: 1,
          max: [
            PRODUCT_CART_ITEM_QUANTITY_LIMIT,
            `Maximum product quantity - ${PRODUCT_CART_SIZE_LIMIT}`,
          ],
        },
      },
    ],
    default: () => [],
  })
  products: ProductCartItemEntity[];

  @Prop({
    required: true,
    type: 'Number',
    min: 0,
    max: [
      PRODUCT_CART_SIZE_LIMIT,
      `Cart limit is ${PRODUCT_CART_SIZE_LIMIT} products.`,
    ],
    default: (): number => 0,
  })
  totalAmount: number;

  @Prop({
    required: true,
    type: 'Number',
    min: 0,
    default: (): number => 0,
  })
  totalSum: number;

  id?: string;
}

export const ProductCartSchema: mongoose.Schema<ProductCart> =
  SchemaFactory.createForClass(ProductCart);
export type ProductCartDocument = ProductCart & Document;
export interface ProductCartModel extends mongoose.Model<ProductCartDocument> {
  getTotalSum(products: ProductCartItemEntity[]): Promise<number>;
}
export const PRODUCT_CART_MODEL: string = ProductCart.name;

ProductCartSchema.pre(
  /^(findOne|find)/,
  async function (next: CallbackWithoutResultAndOptionalError) {
    this.populate('user');
    this.populate({
      path: 'products.product',
      populate: [
        {
          path: 'productBrand',
          model: PRODUCT_BRANDS_COLLECTION_NAME,
        },
        {
          path: 'productModel',
          model: PRODUCT_MODELS_COLLECTION_NAME,
        },
      ],
    });
    next();
  },
);

ProductCartSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const products: ProductCartItemEntity[] = this.products || [];
    if (products.length > PRODUCT_CART_SIZE_LIMIT) {
      throw new ConflictException(PRODUCT_CART_SIZE_LIMIT_ERROR);
    } else {
      this.totalAmount = products.length;
      this.totalSum = await (
        this.$model(PRODUCT_CART_MODEL) as ProductCartModel
      ).getTotalSum(products);
      next();
    }
  },
);

ProductCartSchema.pre(
  'findOneAndUpdate',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const products: ProductCartItemEntity[] =
      (this.getUpdate() as UpdateProductCartDto).products || [];

    if (products.length > PRODUCT_CART_SIZE_LIMIT) {
      throw new ConflictException(PRODUCT_CART_SIZE_LIMIT_ERROR);
    } else {
      this.findOneAndUpdate(this.getFilter(), {
        totalAmount: products.length,
        totalSum: await (this.model as ProductCartModel).getTotalSum(products),
      });
      next();
    }
  },
);
