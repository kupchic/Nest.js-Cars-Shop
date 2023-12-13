import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { createMock } from '@golevelup/ts-jest';
import { Product } from './schemas';
import { NotFoundException } from '@nestjs/common';
import SpyInstance = jest.SpyInstance;

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: createMock<ProductService>(),
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('search', () => {
    it('should call search method from product service', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'search')
        .mockResolvedValueOnce(null);
      // when
      await controller.search();
      expect(spy).nthCalledWith(1, undefined, undefined);
    });
  });
  describe('getOne', () => {
    it('should call getById method of productService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'getById')
        .mockResolvedValueOnce({} as Product);
      // when
      const result: Product = await controller.getOne('id');
      // then
      expect(result).toEqual({});
      expect(spy).nthCalledWith(1, 'id');
    });
    it('should throw not found error if product was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Product not Found',
      );
      jest.spyOn(productService, 'getById').mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.getOne('id')).rejects.toEqual(expectedError);
    });
  });
  describe('create', () => {
    it('should call createProduct method of productService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'createProduct')
        .mockResolvedValueOnce({} as Product);
      // when
      const result: Product = await controller.create(null);
      // then
      expect(result).toEqual({});
      expect(spy).nthCalledWith(1, null);
    });
  });
  describe('updateProduct', () => {
    it('should call updateProduct method of productService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'updateProduct')
        .mockResolvedValueOnce({} as Product);
      // when
      const result: Product = await controller.updateProduct('id', null);
      // then
      expect(result).toEqual({});
      expect(spy).nthCalledWith(1, 'id', null);
    });
  });
  describe('getOne', () => {
    it('should call deleteProduct method of productService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'deleteProduct')
        .mockResolvedValueOnce({} as Product);
      // when
      const result: void = await controller.delete('id');
      // then
      expect(result).toBeUndefined();
      expect(spy).nthCalledWith(1, 'id');
    });
    it('should throw not found error if product was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Product not Found',
      );
      jest.spyOn(productService, 'deleteProduct').mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.delete('id')).rejects.toEqual(expectedError);
    });
  });
});
