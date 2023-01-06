import { Injectable } from '@nestjs/common';
import { UpdateProductCartDto } from './dto/update-product-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProductCart, ProductCartModel } from '../schemas';
import { ModelName } from '../../common/model';

@Injectable()
export class ProductCartService {
  constructor(
    @InjectModel(ModelName.PRODUCT_CART)
    private cartModel: ProductCartModel,
  ) {}

  findAll(): Promise<ProductCart[]> {
    return this.cartModel.find().exec();
  }

  findOne(id: string): Promise<ProductCart> {
    return this.cartModel.findById(id).exec();
  }

  findByUserId(userId): Promise<ProductCart> {
    return this.cartModel.findOne({ user: userId }).exec();
  }

  update(
    id: string,
    updateProductCartDto: UpdateProductCartDto,
  ): Promise<ProductCart> {
    return this.cartModel
      .findByIdAndUpdate(id, updateProductCartDto, { new: true })
      .exec();
  }
}
