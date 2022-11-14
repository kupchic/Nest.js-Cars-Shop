import { Test, TestingModule } from '@nestjs/testing';
import { ProductModelController } from './product-model.controller';

describe('ProductModelController', () => {
  let controller: ProductModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductModelController],
    }).compile();

    controller = module.get<ProductModelController>(ProductModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
