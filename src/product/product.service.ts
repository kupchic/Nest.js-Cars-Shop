import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import {
  Product,
  ProductBrand,
  ProductDocument,
  ProductModel,
} from './schemas';
import { CreateProductDto, ProductFiltersDto, UpdateProductDto } from './dto';
import { ProductModelService } from './product-model/product-model.service';
import { ProductBrandService } from './product-brand/product-brand.service';
import {
  KeyValuePairs,
  ModelName,
  OrderByEnum,
  SearchQueryDto,
} from '../common/model';
import { IPaginatedProductResponse } from './model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ModelName.PRODUCT)
    private productModel: Model<ProductDocument>,
    private productModelService: ProductModelService,
    private productBrandService: ProductBrandService,
  ) {}

  async search(
    query?: SearchQueryDto,
    filters?: ProductFiltersDto,
  ): Promise<IPaginatedProductResponse> {
    try {
      const filterMatch: FilterQuery<Product> = { $and: [] };
      const searchMatch: FilterQuery<Product> = { $or: [] };
      const sort: KeyValuePairs<any> = {};
      if (filters) {
        if (filters.productBrand) {
          filterMatch.$and.push({
            productBrand: new mongoose.Types.ObjectId(filters.productBrand),
          });
        }
        if (filters.productModel) {
          filterMatch.$and.push({
            productModel: new mongoose.Types.ObjectId(filters.productModel),
          });
        }
        if (filters.priceTo || filters.priceFrom) {
          filterMatch.$and.push({
            price: {
              $gte: filters.priceFrom || 0,
              $lte: filters.priceTo || Infinity,
            },
          });
        }
      }
      if (query?.sortBy) {
        sort[query.sortBy] = query?.orderBy === OrderByEnum.DESC ? -1 : 1;
      } else {
        sort.createdAt = -1;
      }
      const page: number = parseInt(query?.page || '1') - 1;
      const limit: number = parseInt(query?.pageSize || '20');
      const skip: number = page * limit;
      if (query?.search) {
        const reg: RegExp = new RegExp(query.search.split(' ').join('|'), 'i');
        searchMatch['$or'] = [
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

      if (!filterMatch.$and.length) {
        delete filterMatch.$and;
      }
      if (!searchMatch.$or.length) {
        delete searchMatch.$or;
      }

      return await this.productModel
        .aggregate<any>([
          {
            $match: filterMatch,
          },
          {
            $lookup: {
              from: ModelName.PRODUCT_BRAND,
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
              from: ModelName.PRODUCT_MODEL,
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
                {
                  $match: {
                    bodyType: {
                      [filters?.bodyType ? '$eq' : '$ne']: filters?.bodyType,
                    },
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
            $match: searchMatch,
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
          {
            $facet: {
              pagination: [
                {
                  $count: 'totalRecords',
                },
              ],
              data: [],
            },
          },
          {
            $set: {
              pagination: { $first: '$pagination' },
            },
          },
          {
            $addFields: {
              'pagination.page': page + 1,
              'pagination.pageSize': limit,
              'pagination.pagesCount': {
                $ceil: {
                  $divide: ['$pagination.totalRecords', limit],
                },
              },
            },
          },
        ])
        .exec()
        .then((res: IPaginatedProductResponse[]) => res[0]);
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
      throw e;
    }
  }

  async deleteProduct(id: string): Promise<Product> {
    try {
      return this.productModel.findByIdAndDelete(id).exec();
    } catch (e) {
      throw e;
    }
  }

  async getById(id: string): Promise<Product> {
    try {
      return await this.productModel
        .findById(id)
        .populate(this._populateFields)
        .exec();
    } catch (e) {
      throw e;
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
