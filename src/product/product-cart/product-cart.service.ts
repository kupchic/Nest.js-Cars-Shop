import { Injectable } from '@nestjs/common';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import { UpdateProductCartDto } from './dto/update-product-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  PRODUCT_CART_COLLECTION_NAME,
  ProductCartDocument,
} from '../schemas/product-cart.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductCartService {
  constructor(
    @InjectModel(PRODUCT_CART_COLLECTION_NAME)
    private cartModel: Model<ProductCartDocument>,
  ) {}

  async create(createProductCartDto: CreateProductCartDto): Promise<any> {
    return await this.cartModel.create(createProductCartDto);
  }

  findAll(): void {}

  findOne(): void {}

  update(id: number, updateProductCartDto: UpdateProductCartDto): void {}

  remove(id: number): void {}
}
