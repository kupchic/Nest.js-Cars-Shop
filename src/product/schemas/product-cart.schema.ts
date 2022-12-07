import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { User } from '../../user/schemas';
import { Product } from './product.schema';
import { ProductCartItem } from '../product-cart/entities/product-cart-item.entity';

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
    ref: User.name,
    unique: true,
  })
  user: string;

  @Prop({
    required: true,
    type: [ProductCartItem],
    ref: Product.name,
  })
  products: ProductCartItem[];
}

export const ProductCartSchema: mongoose.Schema<ProductCart> =
  SchemaFactory.createForClass(ProductCart);
export type ProductCartDocument = ProductCart & Document;

ProductCartSchema.pre(
  'save',
  function (next: CallbackWithoutResultAndOptionalError) {
    console.log(this);
    next();
  },
);
