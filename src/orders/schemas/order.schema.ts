import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Document,
  ToObjectOptions,
} from 'mongoose';
import { ConflictException } from '@nestjs/common';

import { PRODUCT_CART_ITEM_QUANTITY_LIMIT } from '../../product/model/consts/product-cart-item-quantity-limit';
import { ProductCartItemEntity } from '../../product/product-cart/entities/product-cart-item.entity';
import {
  PRODUCT_CART_SIZE_LIMIT,
  PRODUCT_CART_SIZE_LIMIT_ERROR,
} from '../../product/model/consts/product-cart-size-limit';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { getProductsTotalSum } from '../../common/utils';
import { OrderStatus } from '../model/enums/order-status';
import {
  CollectionsName,
  ModelName,
  PRODUCT_POPULATE_OPTIONS,
} from '../../common/model';

const ordersOptions: ToObjectOptions = {
  virtuals: true,
  transform: function (doc, model) {
    delete model._id;
    return model;
  },
};

@Schema({
  collection: CollectionsName.ORDERS,
  toJSON: ordersOptions,
  versionKey: false,
  virtuals: true,
  timestamps: true,
  statics: {
    async getTotalSum(productCatItems: ProductCartItemEntity[]) {
      return getProductsTotalSum.call(this, productCatItems);
    },
  },
})
export class Order {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: () => ModelName.USER,
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
          ref: (): any => ModelName.PRODUCT,
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

  @Prop({
    type: 'Number',
    min: 1,
  })
  orderNo: number;

  @Prop({
    required: true,
    enum: OrderStatus,
    default: () => OrderStatus.IN_PROGRESS,
  })
  status: OrderStatus;

  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const OrderSchema: mongoose.Schema<Order> =
  SchemaFactory.createForClass(Order);
export type OrderDocument = Order & Document;
export interface OrderModel extends mongoose.Model<OrderDocument> {
  getTotalSum(products: ProductCartItemEntity[]): Promise<number>;
}
OrderSchema.pre(
  /^(findOne|find)/,
  async function (next: CallbackWithoutResultAndOptionalError) {
    this.populate([
      'user',
      {
        path: 'products.product',
        populate: PRODUCT_POPULATE_OPTIONS,
      },
    ]);
    next();
  },
);

OrderSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const products: ProductCartItemEntity[] = this.products || [];
    if (products.length > PRODUCT_CART_SIZE_LIMIT) {
      throw new ConflictException(PRODUCT_CART_SIZE_LIMIT_ERROR);
    } else {
      this.totalAmount = products.length;
      this.totalSum = await (
        this.$model(ModelName.ORDER) as OrderModel
      ).getTotalSum(products);
      this.orderNo = await this.$model(ModelName.ORDER).countDocuments();
      await this.$model(ModelName.USER).updateOne(
        { _id: this.user },
        { $push: { orders: this.id } },
      ); // add order id to user orders
      await this.$model(ModelName.PRODUCT_CART).findOneAndUpdate(
        { user: this.user },
        { $set: { products: [] } },
      ); // empty user cart
      next();
    }
  },
);

OrderSchema.pre(
  'findOneAndUpdate',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const products: ProductCartItemEntity[] =
      (this.getUpdate() as UpdateOrderDto).products || [];

    if (products.length > PRODUCT_CART_SIZE_LIMIT) {
      throw new ConflictException(PRODUCT_CART_SIZE_LIMIT_ERROR);
    } else {
      this.findOneAndUpdate(this.getFilter(), {
        totalAmount: products.length,
        totalSum: await (this.model as OrderModel).getTotalSum(products),
      });
      next();
    }
  },
);
