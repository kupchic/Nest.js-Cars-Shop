import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { USER_MODEL } from '../../user/schemas';
import { ProductCartItemEntity } from '../product-cart/entities/product-cart-item.entity';
import { Product } from './product.schema';

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
})
export class ProductCart {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: () => USER_MODEL,
    unique: true,
  })
  user: string;

  @Prop({
    required: true,
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Product.name,
        },
        quantity: { type: 'Number', min: 1 },
      },
    ],
    default: () => [],
  })
  products: ProductCartItemEntity[];

  id?: string;
}

export const ProductCartSchema: mongoose.Schema<ProductCart> =
  SchemaFactory.createForClass(ProductCart);
export type ProductCartDocument = ProductCart & Document;
export type ProductCartModel = mongoose.Model<ProductCartDocument>;
export const PRODUCT_CART_MODEL: string = ProductCart.name;

ProductCartSchema.pre(
  /^(findOne|find)/,
  function (next: CallbackWithoutResultAndOptionalError) {
    this.populate('user');
    next();
  },
);
