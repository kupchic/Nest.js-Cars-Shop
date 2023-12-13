import { Test, TestingModule } from '@nestjs/testing';
import { ProductCartService } from './product-cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { ModelName } from '../../common/model';

describe('ProductCartService', () => {
  let service: ProductCartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCartService,
        {
          provide: getModelToken(ModelName.PRODUCT_CART),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductCartService>(ProductCartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
