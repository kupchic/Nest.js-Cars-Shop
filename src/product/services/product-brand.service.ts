import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductBrand, ProductBrandDocument } from '../schemas';
import { Model } from 'mongoose';
import { CreateProductBrandDto, UpdateProductBrandDto } from '../dto';

@Injectable()
export class ProductBrandService {
  constructor(
    @InjectModel(ProductBrand.name)
    private productBrandModel: Model<ProductBrandDocument>,
  ) {}

  async findByName(name: string): Promise<ProductBrand> {
    try {
      return await this.productBrandModel.findOne({ name }).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async create(dto: CreateProductBrandDto): Promise<ProductBrand> {
    try {
      return await this.productBrandModel.create(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getAllBrands(): Promise<ProductBrand[]> {
    try {
      return await this.productBrandModel.find().exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getBrand(id: string): Promise<ProductBrand> {
    try {
      return await this.productBrandModel.findById(id).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteBrand(id: string): Promise<ProductBrand> {
    try {
      return await this.productBrandModel.findByIdAndDelete(id).exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateBrand(
    id,
    toUpdate: UpdateProductBrandDto,
  ): Promise<ProductBrand> {
    try {
      return this.productBrandModel.findByIdAndUpdate(id, toUpdate, {
        new: true,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
