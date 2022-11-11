import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductModelService } from './product-model.service';
import { ProductModel } from '../schemas/product-model.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private productModelService: ProductModelService,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productModel.find().exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async createProduct(createDto: CreateProductDto): Promise<Product> {
    try {
      let model: ProductModel = await this.productModelService.findByName(
        createDto.carModel,
      );
      if (!model) {
        model = await this.productModelService.create(createDto.carModel);
      }
      return await this.productModel.create({ ...createDto, carModel: model });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const product: Product = await this.productModel.findByIdAndDelete(id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    } catch (e) {
      throw e instanceof NotFoundException
        ? e
        : new BadRequestException(e.message);
    }
  }

  async getById(id: string): Promise<Product> {
    try {
      return await this.productModel.findById(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
