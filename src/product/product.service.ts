import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  Product,
  ProductBrand,
  ProductDocument,
  ProductModel,
} from './schemas';
import { CreateProductDto, ProductFiltersDto, UpdateProductDto } from './dto';
import { ProductModelService } from './product-model/product-model.service';
import { ProductBrandService } from './product-brand/product-brand.service';
import { KeyValuePairs, OrderByEnum } from '../common/model';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private productModelService: ProductModelService,
    private productBrandService: ProductBrandService,
  ) {}

  async search(
    query?: ProductSearchQueryDto,
    filters?: ProductFiltersDto,
  ): Promise<Product[]> {
    try {
      const match: FilterQuery<Product> = {};
      const sort: KeyValuePairs<any> = {};
      if (query?.sortBy && query?.orderBy) {
        sort[query.sortBy] = query.orderBy === OrderByEnum.DESC ? -1 : 1;
      } else {
        sort.createdAt = -1;
      }
      const limit: number = parseInt(query?.pageSize || '20');
      const skip: number = (parseInt(query?.page || '1') - 1) * limit;
      if (query?.search) {
        const reg: RegExp = new RegExp(query.search, 'i');
        match['$or'] = [
          {
            description: reg,
          },
          {
            'productModel.modelName': reg,
          },
          {
            'productBrand.brandName': reg,
          },
        ];
      }
      return await this.productModel.aggregate<Product>([
        {
          $lookup: {
            from: 'productbrands',
            localField: 'productBrand',
            foreignField: '_id',
            as: 'productBrand',
            pipeline: [
              {
                $addFields: {
                  id: {
                    $toString: '$_id',
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'productmodels',
            localField: 'productModel',
            foreignField: '_id',
            as: 'productModel',
            pipeline: [
              {
                $addFields: {
                  id: {
                    $toString: '$_id',
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$productBrand',
          },
        },
        {
          $unwind: {
            path: '$productModel',
          },
        },
        {
          $match: match,
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $sort: sort,
        },
        {
          $addFields: {
            id: {
              $toString: '$_id',
            },
          },
        },
        {
          $unset: '_id', // or $project
        },
      ]);
    } catch (e) {
      throw e;
    }
  }

  async createProduct(createDto: CreateProductDto): Promise<Product> {
    try {
      const model: ProductModel = await this.productModelService.getModel(
        createDto.productModel,
      );
      if (!model) {
        throw new BadRequestException(
          'Not Possible to create a product. Model with such id is not found.',
        );
      }
      const brand: ProductBrand = await this.productBrandService.getBrand(
        createDto.productBrand,
      );
      if (!brand) {
        throw new BadRequestException(
          'Not Possible to create a product. Brand with such id is not found.',
        );
      }
      return await this.productModel.create({
        ...createDto,
        productModel: model,
        productBrand: brand,
      });
    } catch (e) {
      throw e;
    }
  }

  async updateProduct(
    id: string,
    updateDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      return await this.productModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .populate(this._populateFields)
        .exec();
    } catch (e) {
      new BadRequestException(e.message);
    }
  }

  async deleteProduct(id: string): Promise<Product> {
    try {
      return this.productModel.findByIdAndDelete(id);
    } catch (e) {
      new BadRequestException(e.message);
    }
  }

  async getById(id: string): Promise<Product> {
    try {
      return await this.productModel
        .findById(id)
        .populate(this._populateFields)
        .exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteProductModel(id: string): Promise<ProductModel> {
    try {
      const product: ProductModel = await this.productModel.findOne({
        productModel: id,
      });
      if (product) {
        throw new ConflictException(
          'This model is already used in the catalogs, deleting is impossible',
        );
      }
      return await this.productModelService.deleteModel(id);
    } catch (e) {
      throw e;
    }
  }

  async deleteProductBrand(id: string): Promise<ProductBrand> {
    try {
      const product: ProductModel = await this.productModel.findOne({
        productBrand: id,
      });
      if (product) {
        throw new ConflictException(
          'This brand is already used in the catalogs, deleting is impossible',
        );
      }
      return await this.productBrandService.deleteBrand(id);
    } catch (e) {
      throw e;
    }
  }

  private get _populateFields(): string[] {
    return ['productModel', 'productBrand'];
  }
}
