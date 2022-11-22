import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import * as mongoose from 'mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  Product,
  PRODUCT_BRANDS_COLLECTION_NAME,
  PRODUCT_MODELS_COLLECTION_NAME,
  ProductDocument,
  PRODUCTS_COLLECTION_NAME,
} from './schemas';
import { getModelToken } from '@nestjs/mongoose';
import { ProductModelService } from './product-model/product-model.service';
import { createMock } from '@golevelup/ts-jest';
import { ProductBrandService } from './product-brand/product-brand.service';
import { KeyValuePairs, OrderByEnum } from '../common/model';
import { ProductFiltersDto } from './dto';
import { BodyTypes } from './model';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';
import SpyInstance = jest.SpyInstance;

describe('ProductService', () => {
  let service: ProductService;
  let mockModel: Model<ProductDocument>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(PRODUCTS_COLLECTION_NAME),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: ProductModelService,
          useValue: createMock<ProductModelService>(),
        },
        {
          provide: ProductBrandService,
          useValue: createMock<ProductBrandService>(),
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    mockModel = module.get(getModelToken(PRODUCTS_COLLECTION_NAME));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should call aggregate with default aggregate setup if called without args and return first item after exec()', async () => {
      // given
      const expectedMatches: any[] = [
        {},
        {},
        { $ne: undefined },
        { createdAt: -1 },
        {
          pageSize: 20,
          skip: 0,
          page: 1,
        },
      ];
      const expectedItem: string = 'firstItem';
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'aggregate')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([expectedItem] as never),
        } as any);
      // when
      const res: any = await service.search();
      // then
      expect(spy).toHaveBeenNthCalledWith(
        1,
        createSearchAggregateQuery.call(null, ...expectedMatches),
      );
      expect(res).toBe(expectedItem);
    });
    it('should call aggregate with prefilled aggregate setup if called with args and return first item after exec()', async () => {
      // given
      const filtersDto: ProductFiltersDto = {
        priceTo: 10000,
        bodyType: BodyTypes.MINIVAN,
        productBrand: '507f1f77bcf86cd799439011',
        productModel: '507f1f77bcf86cd799439011',
      };

      const query: ProductSearchQueryDto = {
        search: 'audi ауди',
        page: '10a',
        pageSize: '15.1',
        sortBy: 'price',
        orderBy: OrderByEnum.DESC,
      };
      const reg: RegExp = new RegExp(query.search.split(' ').join('|'), 'i');
      const expectedMatches: any[] = [
        {
          $and: [
            {
              productBrand: new mongoose.Types.ObjectId(
                filtersDto.productBrand,
              ),
            },
            {
              productModel: new mongoose.Types.ObjectId(
                filtersDto.productModel,
              ),
            },
            {
              price: {
                $gte: 0,
                $lte: filtersDto.priceTo,
              },
            },
          ],
        },
        {
          $or: [
            {
              description: reg,
            },
            {
              'productModel.modelName': reg,
            },
            {
              'productBrand.brandName': reg,
            },
          ],
        },
        { $eq: filtersDto.bodyType },
        { [query.sortBy]: -1 },
        {
          pageSize: 15,
          page: 10,
          skip: 135,
        },
      ];
      const expectedItem: string = 'firstItem';
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'aggregate')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([expectedItem] as never),
        } as any);
      // when
      const res: any = await service.search(query, filtersDto);
      // then
      expect(spy).toHaveBeenNthCalledWith(
        1,
        createSearchAggregateQuery.call(null, ...expectedMatches),
      );
      expect(res).toBe(expectedItem);
    });
    it('should call aggregate with prefilled aggregate setup wit asc sort and priceTo as infinity if called with args and return first item after exec()', async () => {
      // given
      const filtersDto: ProductFiltersDto = {
        priceFrom: 10000,
      };

      const query: ProductSearchQueryDto = {
        page: '2',
        pageSize: '10',
        sortBy: 'price',
        orderBy: OrderByEnum.ASC,
      };
      const expectedMatches: any[] = [
        {
          $and: [
            {
              price: {
                $gte: filtersDto.priceFrom,
                $lte: Infinity,
              },
            },
          ],
        },
        {},
        { $eq: filtersDto.bodyType },
        { [query.sortBy]: 1 },
        {
          pageSize: 10,
          page: 2,
          skip: 10,
        },
      ];
      const expectedItem: string = 'firstItem';
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'aggregate')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([expectedItem] as never),
        } as any);
      // when
      const res: any = await service.search(query, filtersDto);
      // then
      expect(spy).toHaveBeenNthCalledWith(
        1,
        createSearchAggregateQuery.call(null, ...expectedMatches),
      );
      expect(res).toBe(expectedItem);
    });
    it('should catch error', async () => {
      // given
      const error: Error = new Error('some error');
      jest.spyOn(mockModel, 'aggregate').mockReturnValueOnce({
        exec: jest.fn().mockImplementation(() => {
          throw error;
        }),
      } as any);
      // when
      // then
      await expect(service.search()).rejects.toEqual(error);
    });
  });
});

function createSearchAggregateQuery(
  filterMatch: FilterQuery<Product>,
  searchMatch: FilterQuery<Product>,
  productModelMatch: FilterQuery<Product>,
  sort: KeyValuePairs<any>,
  pagination: KeyValuePairs<any>,
): mongoose.PipelineStage[] {
  return [
    {
      $match: filterMatch,
    },
    {
      $lookup: {
        from: PRODUCT_BRANDS_COLLECTION_NAME,
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
        from: PRODUCT_MODELS_COLLECTION_NAME,
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
              bodyType: productModelMatch,
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
      $skip: pagination?.skip,
    },
    {
      $limit: pagination?.pageSize,
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
        'pagination.page': pagination?.page,
        'pagination.pageSize': pagination?.pageSize,
        'pagination.pagesCount': {
          $ceil: {
            $divide: ['$pagination.totalRecords', pagination?.pageSize],
          },
        },
      },
    },
  ];
}
