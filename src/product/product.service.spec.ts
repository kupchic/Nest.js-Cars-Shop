import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Model } from 'mongoose';
import { ProductDocument, PRODUCTS_COLLECTION_NAME } from './schemas';
import { getModelToken } from '@nestjs/mongoose';
import { ProductModelService } from './product-model/product-model.service';
import { createMock } from '@golevelup/ts-jest';
import { ProductBrandService } from './product-brand/product-brand.service';

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should ', async () => {
      const res: any = await service.search();
      expect(res).toBeUndefined();
    });
  });
});
