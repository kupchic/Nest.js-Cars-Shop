import { Test, TestingModule } from '@nestjs/testing';
import { ProductModelService } from './product-model.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  PRODUCT_MODELS_COLLECTION_NAME,
  ProductModel,
  ProductModelDocument,
} from '../schemas';
import { BodyTypes, EngineTypes, TransmissionTypes } from '../model';
import { Model } from 'mongoose';
import { CreateProductModelDto } from '../dto';
import { BadRequestException } from '@nestjs/common';
import SpyInstance = jest.SpyInstance;

describe('ProductModelService', () => {
  let service: ProductModelService;
  let mockModel: Model<ProductModelDocument>;
  const mockProductModel: ProductModel = {
    id: 'id',
    bodyType: BodyTypes.MINIVAN,
    engineType: EngineTypes.W_TYPE,
    engineSize: 2,
    modelName: 'name',
    transmissionType: TransmissionTypes.AUTOMATIC,
    drive: '2',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductModelService,
        {
          provide: getModelToken(PRODUCT_MODELS_COLLECTION_NAME),
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

    service = module.get<ProductModelService>(ProductModelService);
    mockModel = module.get(getModelToken(PRODUCT_MODELS_COLLECTION_NAME));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call create model', async () => {
      const { id, ...dto } = mockProductModel;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'create')
        .mockResolvedValueOnce(mockProductModel as never);
      // when
      const result: ProductModel = await service.create(
        dto as CreateProductModelDto,
      );
      // then
      expect(result).toEqual(mockProductModel);
      expect(spy).nthCalledWith(1, dto);
    });
    it('should catch error', async () => {
      const { id, ...dto } = mockProductModel;
      const expectedError: BadRequestException = new BadRequestException(
        'error',
      );
      jest.spyOn(mockModel, 'create').mockImplementation(() => {
        throw expectedError;
      });
      // when
      //then
      await expect(
        service.create(dto as CreateProductModelDto),
      ).rejects.toEqual(expectedError);
    });
  });

  describe('getAllModels', () => {
    it('should call find with exec()', async () => {
      const spy: SpyInstance = jest.spyOn(mockModel, 'find').mockReturnValue({
        exec: () => Promise.resolve([mockProductModel]),
      } as never);
      // when
      const result: ProductModel[] = await service.getAllModels();
      // then
      expect(result).toEqual([mockProductModel]);
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
      await expect(service.getAllModels()).rejects.toEqual(expectedError);
    });
  });
  describe('getModel', () => {
    it('should call findByID with exec()', async () => {
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findById')
        .mockReturnValue({
          exec: () => Promise.resolve(mockProductModel),
        } as never);
      // when
      const result: ProductModel = await service.getModel(mockProductModel.id);
      // then
      expect(result).toEqual(mockProductModel);
      expect(spy).nthCalledWith(1, mockProductModel.id);
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
      await expect(service.getModel('2')).rejects.toEqual(expectedError);
    });
  });
  describe('deleteModel', () => {
    it('should call findByIDAndDelete with exec()', async () => {
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findByIdAndDelete')
        .mockReturnValue({
          exec: () => Promise.resolve(mockProductModel),
        } as never);
      // when
      const result: ProductModel = await service.deleteModel(
        mockProductModel.id,
      );
      // then
      expect(result).toEqual(mockProductModel);
      expect(spy).nthCalledWith(1, mockProductModel.id);
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
      await expect(service.deleteModel('2')).rejects.toEqual(expectedError);
    });
  });
  describe('updateModel', () => {
    it('should call findByIdAndUpdate', async () => {
      const { id, ...dto } = mockProductModel;
      const spy: SpyInstance = jest
        .spyOn(mockModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(mockProductModel as never);
      // when
      const result: ProductModel = await service.updateModel(
        mockProductModel.id,
        dto as CreateProductModelDto,
      );
      // then
      expect(result).toEqual(mockProductModel);
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
      await expect(service.updateModel('1', null)).rejects.toEqual(
        expectedError,
      );
    });
  });
});
