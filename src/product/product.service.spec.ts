import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import * as mongoose from 'mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  Product,
  PRODUCT_BRANDS_COLLECTION_NAME,
  PRODUCT_MODELS_COLLECTION_NAME,
  ProductBrand,
  ProductDocument,
  ProductModel,
  PRODUCTS_COLLECTION_NAME,
} from './schemas';
import { getModelToken } from '@nestjs/mongoose';
import { ProductModelService } from './product-model/product-model.service';
import { createMock } from '@golevelup/ts-jest';
import { ProductBrandService } from './product-brand/product-brand.service';
import { KeyValuePairs, OrderByEnum } from '../common/model';
import { CreateProductDto, ProductFiltersDto } from './dto';
import { BodyTypes, ProductColors } from './model';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import SpyInstance = jest.SpyInstance;

describe('ProductService', () => {
  let service: ProductService;
  let mockModel: Model<ProductDocument>;
  let mockModelService: ProductModelService;
  let mockBrandService: ProductBrandService;
  const createDTO: CreateProductDto = {
    productBrand: 'brandId',
    productModel: 'modelId',
    yearOfIssue: 2222,
    price: 100,
    description: 'any',
    color: ProductColors.BLACK,
    warranty: 10,
  };
  const fieldsToPopulate: string[] = ['productModel', 'productBrand'];
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
    mockModelService = module.get<ProductModelService>(ProductModelService);
    mockBrandService = module.get<ProductBrandService>(ProductBrandService);
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
  describe('createProduct', () => {
    it('should throw error if product model was not found by id from crete dto', async () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'Not Possible to create a product. Model with such id is not found.',
      );
      const spy: SpyInstance = jest
        .spyOn(mockModelService, 'getModel')
        .mockResolvedValueOnce(null);
      // when
      // then
      await expect(service.createProduct(createDTO)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, createDTO.productModel);
    });
    it('should throw error if brand model was not found by id from crete dto', async () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'Not Possible to create a product. Brand with such id is not found.',
      );
      jest
        .spyOn(mockModelService, 'getModel')
        .mockResolvedValueOnce({ id: createDTO.productModel } as ProductModel);
      const spy: SpyInstance = jest
        .spyOn(mockBrandService, 'getBrand')
        .mockResolvedValueOnce(null);
      // when
      // then
      await expect(service.createProduct(createDTO)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, createDTO.productBrand);
    });
    it('should successfully create product if brand and model was found by id from crete dto', async () => {
      // given
      const model: ProductModel = {
        id: createDTO.productModel,
      } as ProductModel;
      const brand: ProductBrand = {
        id: createDTO.productBrand,
      } as ProductBrand;
      const product: Product = { id: 'newProduct' } as Product;
      jest.spyOn(mockModelService, 'getModel').mockResolvedValueOnce(model);
      jest.spyOn(mockBrandService, 'getBrand').mockResolvedValueOnce(brand);
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'create')
        .mockResolvedValueOnce(product as never);
      // when
      const result: Product = await service.createProduct(createDTO);
      // then
      expect(result).toEqual(product);
      expect(spy).nthCalledWith(1, {
        ...createDTO,
        productModel: model,
        productBrand: brand,
      });
    });
  });
  describe('updateProduct', () => {
    it('should call findByIdAndUpdate method with flag new and populate and exec', async () => {
      // given
      const product: Product = { id: 'newProduct' } as Product;
      const populateSpy: SpyInstance = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(product as never),
      });
      const updateArgs: any = ['id', { price: 12 }];
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({
          populate: populateSpy,
        } as any);
      // when
      const result: Product = await service.updateProduct(
        updateArgs[0],
        updateArgs[1],
      );
      // then
      expect(spy).nthCalledWith(1, ...updateArgs, { new: true });
      expect(populateSpy).nthCalledWith(1, fieldsToPopulate);
      expect(result).toEqual(product);
    });
    it('should catch error', async () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'some error',
      );
      jest.spyOn(mockModel, 'findByIdAndUpdate').mockImplementation(() => {
        throw new Error(expectedError.message);
      });
      // then
      await expect(service.updateProduct('id', null)).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('product getById', () => {
    it('should call findById method with flag and populate and exec', async () => {
      // given
      const product: Product = { id: 'newProduct' } as Product;
      const populateSpy: SpyInstance = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(product as never),
      });
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findById')
        .mockReturnValueOnce({
          populate: populateSpy,
        } as any);
      // when
      const result: Product = await service.getById(product.id);
      // then
      expect(spy).nthCalledWith(1, product.id);
      expect(populateSpy).nthCalledWith(1, fieldsToPopulate);
      expect(result).toEqual(product);
    });
    it('should catch error', async () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'some error',
      );
      jest.spyOn(mockModel, 'findById').mockImplementation(() => {
        throw expectedError;
      });
      // then
      await expect(service.getById('id')).rejects.toEqual(expectedError);
    });
  });
  describe('deleteProduct', () => {
    it('should call findByIdAndDelete method with and exec', async () => {
      // given
      const product: Product = { id: 'newProduct' } as Product;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findByIdAndDelete')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(product as never),
        } as any);
      // when
      const result: Product = await service.deleteProduct(product.id);
      // then
      expect(spy).nthCalledWith(1, product.id);
      expect(result).toEqual(product);
    });
    it('should catch error', async () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'some error',
      );
      jest.spyOn(mockModel, 'findByIdAndDelete').mockImplementation(() => {
        throw new Error(expectedError.message);
      });
      // then
      await expect(service.deleteProduct('id')).rejects.toEqual(expectedError);
    });
  });

  describe('deleteProductModel', () => {
    it('should throw error if you try to delete a model that used in some product', async () => {
      // given
      const expectedError: ConflictException = new ConflictException(
        'This model is already used in the catalogs, deleting is impossible',
      );
      const product: Product = { id: 'newProduct' } as Product;
      const productModel: ProductModel = { id: 'productModel' } as ProductModel;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findOne')
        .mockResolvedValueOnce(product);

      // when
      // then
      await expect(service.deleteProductModel(productModel.id)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, {
        productModel: productModel.id,
      });
    });
    it('should  delete a model that not used in any product', async () => {
      // given
      const productModel: ProductModel = { id: 'productModel' } as ProductModel;
      const spy: SpyInstance = jest
        .spyOn(mockModelService, 'deleteModel')
        .mockResolvedValueOnce(productModel);

      // when
      const result: ProductModel = await service.deleteProductModel(
        productModel.id,
      );
      // then
      await expect(result).toEqual(productModel);
      expect(spy).nthCalledWith(1, productModel.id);
    });
  });
  describe('deleteProductBrand', () => {
    it('should throw error if you try to delete a brand that used in some product', async () => {
      // given
      const expectedError: ConflictException = new ConflictException(
        'This brand is already used in the catalogs, deleting is impossible',
      );
      const product: Product = { id: 'newProduct' } as Product;
      const productBrand: ProductBrand = { id: 'productBrand' } as ProductBrand;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findOne')
        .mockResolvedValueOnce(product);
      // when
      // then
      await expect(service.deleteProductBrand(productBrand.id)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, {
        productBrand: productBrand.id,
      });
    });
    it('should delete a brand that not used in any product', async () => {
      // given
      const productBrand: ProductBrand = { id: 'productBrand' } as ProductBrand;
      const spy: SpyInstance = jest
        .spyOn(mockBrandService, 'deleteBrand')
        .mockResolvedValueOnce(productBrand);

      // when
      const result: ProductBrand = await service.deleteProductBrand(
        productBrand.id,
      );
      // then
      await expect(result).toEqual(productBrand);
      expect(spy).nthCalledWith(1, productBrand.id);
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
