import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PRODUCT_MODELS_COLLECTION_NAME,
  ProductModel,
  ProductModelDocument,
} from '../schemas';
import { Model } from 'mongoose';
import { CreateProductModelDto } from '../dto';
import { UpdateProductModelDto } from '../dto/update-product-model.dto';

@Injectable()
export class ProductModelService {
  constructor(
    @InjectModel(PRODUCT_MODELS_COLLECTION_NAME)
    private productModelsModel: Model<ProductModelDocument>,
  ) {}

  async findByName(name: string): Promise<ProductModel> {
    try {
      return await this.productModelsModel.findOne({ name }).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async create(dto: CreateProductModelDto): Promise<ProductModel> {
    try {
      return await this.productModelsModel.create(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getAllModels(): Promise<ProductModel[]> {
    try {
      return await this.productModelsModel.find().exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getModel(id: string): Promise<ProductModel> {
    try {
      return await this.productModelsModel.findById(id).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteModel(id: string): Promise<ProductModel> {
    try {
      return await this.productModelsModel.findByIdAndDelete(id).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateModel(
    id,
    toUpdate: UpdateProductModelDto,
  ): Promise<ProductModel> {
    try {
      return this.productModelsModel.findByIdAndUpdate(id, toUpdate, {
        new: true,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
