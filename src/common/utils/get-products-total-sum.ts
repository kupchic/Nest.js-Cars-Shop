import { ProductCartItemEntity } from '../../product/product-cart/entities/product-cart-item.entity';
import { Product, ProductDocument } from '../../product/schemas';
import mongoose from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { ModelName } from '../model';

export async function getProductsTotalSum(
  productCatItems: ProductCartItemEntity[],
): Promise<number> {
  const products: Product[] = await this.db.model(ModelName.PRODUCT).find({
    _id: {
      $in: productCatItems.map(
        (v: ProductCartItemEntity) => new mongoose.Types.ObjectId(v.product),
      ),
    },
  });
  if (products.length !== productCatItems.length) {
    throw new ConflictException('Some of cart products do not exist');
  }
  return productCatItems.reduce(
    (acc: number, cartItem: ProductCartItemEntity) =>
      acc +
      cartItem.quantity *
        products.find(
          (product: Product) =>
            (product as ProductDocument)._id.toString() ===
            cartItem.product.toString(),
        ).price,
    0,
  );
}
