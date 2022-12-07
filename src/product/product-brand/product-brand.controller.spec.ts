import { Test, TestingModule } from '@nestjs/testing';
import { ProductBrandController } from './product-brand.controller';
import { ProductBrandService } from './product-brand.service';
import { createMock } from '@golevelup/ts-jest';
import { ProductService } from '../product.service';
import { ProductBrand } from '../schemas';
import { NotFoundException } from '@nestjs/common';
import SpyInstance = jest.SpyInstance;

describe('ProductBrandController', () => {
  let controller: ProductBrandController;
  let productService: ProductService;
  let productBrandService: ProductBrandService;
  const mockProductBrand: ProductBrand = {
    id: 'id',
    brandName: 'brand',
    brandCountry: 'country',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductBrandController],
      providers: [
        {
          provide: ProductBrandService,
          useValue: createMock<ProductBrandService>(),
        },
        {
          provide: ProductService,
          useValue: createMock<ProductService>(),
        },
      ],
    }).compile();

    controller = module.get<ProductBrandController>(ProductBrandController);
    productService = module.get(ProductService);
    productBrandService = module.get(ProductBrandService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllBrands', () => {
    it('should call brandService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productBrandService, 'getAllBrands')
        .mockResolvedValueOnce([mockProductBrand]);
      // when
      const result: ProductBrand[] = await controller.getAllBrands();
      // then
      expect(result).toEqual([mockProductBrand]);
      expect(spy).nthCalledWith(1);
    });
  });

  describe('getBrand', () => {
    it('should call getBrand method of brandService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productBrandService, 'getBrand')
        .mockResolvedValueOnce(mockProductBrand);
      // when
      const result: ProductBrand = await controller.getBrand(
        mockProductBrand.id,
      );
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, mockProductBrand.id);
    });
    it('should throw not found error if brand was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Brand not Found',
      );
      jest.spyOn(productBrandService, 'getBrand').mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.getBrand(mockProductBrand.id)).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('createBrand', () => {
    it('should call create method of brandService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productBrandService, 'create')
        .mockResolvedValueOnce(mockProductBrand);
      const { id, ...dto } = mockProductBrand;
      // when
      const result: ProductBrand = await controller.createBrand(dto);
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, dto);
    });
  });
  describe('updateBrand', () => {
    it('should call updateBrand method of brandService', async () => {
      // given
      const { id, ...dto } = mockProductBrand;
      const spy: SpyInstance = jest
        .spyOn(productBrandService, 'updateBrand')
        .mockResolvedValueOnce(mockProductBrand);
      // when
      const result: ProductBrand = await controller.updateBrand(id, dto);
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, id, dto);
    });
    it('should throw not found error if brand was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Brand not Found',
      );
      jest
        .spyOn(productBrandService, 'updateBrand')
        .mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.updateBrand('2', null)).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('deleteBrand', () => {
    it('should call deleteProductBrand method of productService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'deleteProductBrand')
        .mockResolvedValueOnce(mockProductBrand);
      // when
      const result: void = await controller.deleteBrand(mockProductBrand.id);
      // then
      expect(result).toBeUndefined();
      expect(spy).nthCalledWith(1, mockProductBrand.id);
    });
    it('should throw not found error if brand was not found', async () => {
      // given
      jest
        .spyOn(productService, 'deleteProductBrand')
        .mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.deleteBrand('2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
