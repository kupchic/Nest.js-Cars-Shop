import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductBrand, ProductModelDocument } from '../schemas';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { ProductBrandService } from './product-brand.service';
import { ModelName } from '../../common/model';
import SpyInstance = jest.SpyInstance;

describe('ProductBrandService', () => {
  let service: ProductBrandService;
  let mockModel: Model<ProductModelDocument>;
  const mockProductBrand: ProductBrand = {
    id: 'id',
    brandName: 'brand',
    brandCountry: 'country',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductBrandService,
        {
          provide: getModelToken(ModelName.PRODUCT_BRAND),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductBrandService>(ProductBrandService);
    mockModel = module.get(getModelToken(ModelName.PRODUCT_BRAND));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call create a brand', async () => {
      const { id, ...dto } = mockProductBrand;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'create')
        .mockResolvedValueOnce(mockProductBrand as never);
      // when
      const result: ProductBrand = await service.create(dto);
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, dto);
    });
    it('should catch error', async () => {
      const { id, ...dto } = mockProductBrand;
      const expectedError: BadRequestException = new BadRequestException(
        'error',
      );
      jest.spyOn(mockModel, 'create').mockImplementation(() => {
        throw expectedError;
      });
      // when
      //then
      await expect(service.create(dto)).rejects.toEqual(expectedError);
    });
  });

  describe('getAllBrands', () => {
    it('should call find with exec()', async () => {
      const spy: SpyInstance = jest.spyOn(mockModel, 'find').mockReturnValue({
        exec: () => Promise.resolve([mockProductBrand]),
      } as never);
      // when
      const result: ProductBrand[] = await service.getAllBrands();
      // then
      expect(result).toEqual([mockProductBrand]);
      expect(spy).nthCalledWith(1);
    });
    it('should catch error', async () => {
      const expectedError: BadRequestException = new BadRequestException(
        'error',
      );
      jest.spyOn(mockModel, 'find').mockImplementation(() => {
        throw expectedError;
      });
      // when
      //then
      await expect(service.getAllBrands()).rejects.toEqual(expectedError);
    });
  });
  describe('getBrand', () => {
    it('should call findByID with exec()', async () => {
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findById')
        .mockReturnValue({
          exec: () => Promise.resolve(mockProductBrand),
        } as never);
      // when
      const result: ProductBrand = await service.getBrand(mockProductBrand.id);
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, mockProductBrand.id);
    });
    it('should catch error', async () => {
      const expectedError: BadRequestException = new BadRequestException(
        'error',
      );
      jest.spyOn(mockModel, 'findById').mockImplementation(() => {
        throw expectedError;
      });
      // when
      //then
      await expect(service.getBrand('2')).rejects.toEqual(expectedError);
    });
  });
  describe('deleteBrand', () => {
    it('should call findByIDAndDelete with exec()', async () => {
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findByIdAndDelete')
        .mockReturnValue({
          exec: () => Promise.resolve(mockProductBrand),
        } as never);
      // when
      const result: ProductBrand = await service.deleteBrand(
        mockProductBrand.id,
      );
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, mockProductBrand.id);
    });
    it('should catch error', async () => {
      const expectedError: BadRequestException = new BadRequestException(
        'error',
      );
      jest.spyOn(mockModel, 'findByIdAndDelete').mockImplementation(() => {
        throw expectedError;
      });
      // when
      //then
      await expect(service.deleteBrand('2')).rejects.toEqual(expectedError);
    });
  });
  describe('updateBrand', () => {
    it('should call findByIdAndUpdate', async () => {
      const { id, ...dto } = mockProductBrand;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(mockProductBrand as never);
      // when
      const result: ProductBrand = await service.updateBrand(
        mockProductBrand.id,
        dto,
      );
      // then
      expect(result).toEqual(mockProductBrand);
      expect(spy).nthCalledWith(1, id, dto, { new: true });
    });
    it('should catch error', async () => {
      const expectedError: BadRequestException = new BadRequestException(
        'error',
      );
      jest.spyOn(mockModel, 'findByIdAndUpdate').mockImplementation(() => {
        throw expectedError;
      });
      // when
      //then
      await expect(service.updateBrand('1', null)).rejects.toEqual(
        expectedError,
      );
    });
  });
});
