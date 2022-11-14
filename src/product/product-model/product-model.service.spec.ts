import { Test, TestingModule } from '@nestjs/testing';
import { ProductModelService } from './product-model.service';

describe('ProductModelService', () => {
  let service: ProductModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductModelService],
    }).compile();

    service = module.get<ProductModelService>(ProductModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
