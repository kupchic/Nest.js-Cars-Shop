import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductModel,
  ProductModelDocument,
} from '../schemas/product-model.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductModelService {
  constructor(
    @InjectModel(ProductModel.name)
    private productModelsModel: Model<ProductModelDocument>,
  ) {}

  async findByName(name: string): Promise<ProductModel> {
    try {
      return await this.productModelsModel.findOne({ name }).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async create(name: string): Promise<ProductModel> {
    try {
      return await this.productModelsModel.create({
        name,
      });
    } catch (e) {
      throw e;
    }
  }

  async getAllModels(): Promise<ProductModel[]> {
    try {
      return await this.productModelsModel.find().exec();
    } catch (e) {
      throw e;
    }
  }
}
