import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { User } from '../../user/schemas';
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
    ref: User.name,
    unique: true,
  })
  user: string;

  @Prop({
    required: true,
    type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Product.name,
        },
        quantity: { type: 'Number', min: 0 },
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

const ProductCartModel: ProductCartModel = mongoose.model<
  ProductCartDocument,
  ProductCartModel
>('ProductCart', ProductCartSchema);
export default ProductCartModel;

ProductCartSchema.pre(
  'findOneAndUpdate',
  async function (
    this: ProductCartDocument,
    next: CallbackWithoutResultAndOptionalError,
  ) {
    // await UserModel.findByIdAndUpdate(this.user, {
    //   cart: this.toJSON(),
    // });
    next();
  },
);
