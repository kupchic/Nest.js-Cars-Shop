import { Test, TestingModule } from '@nestjs/testing';
import { ProductCartController } from './product-cart.controller';
import { ProductCartService } from './product-cart.service';
import { createMock } from '@golevelup/ts-jest';

describe('ProductCartController', () => {
  let controller: ProductCartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCartController],
      providers: [
        ProductCartService,
        {
          provide: ProductCartService,
          useValue: createMock<ProductCartService>(),
        },
      ],
    }).compile();

    controller = module.get<ProductCartController>(ProductCartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
