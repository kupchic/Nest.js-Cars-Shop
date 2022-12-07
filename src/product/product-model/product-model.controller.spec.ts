import { Test, TestingModule } from '@nestjs/testing';
import { ProductModelController } from './product-model.controller';
import { createMock } from '@golevelup/ts-jest';
import { ProductService } from '../product.service';
import { ProductModelService } from './product-model.service';
import { ProductModel } from '../schemas';
import { BodyTypes, EngineTypes, TransmissionTypes } from '../model';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductModelDto } from '../dto/update-product-model.dto';
import { CreateProductModelDto } from '../dto';
import SpyInstance = jest.SpyInstance;

describe('ProductModelController', () => {
  let controller: ProductModelController;
  let productService: ProductService;
  let productModelService: ProductModelService;
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
      controllers: [ProductModelController],
      providers: [
        {
          provide: ProductModelService,
          useValue: createMock<ProductModelService>(),
        },
        {
          provide: ProductService,
          useValue: createMock<ProductService>(),
        },
      ],
    }).compile();

    controller = module.get<ProductModelController>(ProductModelController);
    productService = module.get<ProductService>(ProductService);
    productModelService = module.get<ProductModelService>(ProductModelService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getAllModels', () => {
    it('should call modelsService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productModelService, 'getAllModels')
        .mockResolvedValueOnce([mockProductModel]);
      // when
      const result: ProductModel[] = await controller.getAllModels();
      // then
      expect(result).toEqual([mockProductModel]);
      expect(spy).nthCalledWith(1);
    });
  });
  describe('getModel', () => {
    it('should call getModel method of modelService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productModelService, 'getModel')
        .mockResolvedValueOnce(mockProductModel);
      // when
      const result: ProductModel = await controller.getModel(
        mockProductModel.id,
      );
      // then
      expect(result).toEqual(mockProductModel);
      expect(spy).nthCalledWith(1, mockProductModel.id);
    });
    it('should throw not found error if Model was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Model not found',
      );
      jest.spyOn(productModelService, 'getModel').mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.getModel(mockProductModel.id)).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('createModel', () => {
    it('should call create method of ModelService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productModelService, 'create')
        .mockResolvedValueOnce(mockProductModel);
      const { id, ...dto } = mockProductModel;
      // when
      const result: ProductModel = await controller.createModel(
        dto as CreateProductModelDto,
      );
      // then
      expect(result).toEqual(mockProductModel);
      expect(spy).nthCalledWith(1, dto);
    });
  });
  describe('updateModel', () => {
    it('should call updateModel method of ModelService', async () => {
      // given
      const { id, ...dto } = mockProductModel;
      const spy: SpyInstance = jest
        .spyOn(productModelService, 'updateModel')
        .mockResolvedValueOnce(mockProductModel);
      // when
      const result: ProductModel = await controller.updateModel(
        id,
        dto as UpdateProductModelDto,
      );
      // then
      expect(result).toEqual(mockProductModel);
      expect(spy).nthCalledWith(1, id, dto);
    });
    it('should throw not found error if Model was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Model not found',
      );
      jest
        .spyOn(productModelService, 'updateModel')
        .mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.updateModel('2', null)).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('deleteModel', () => {
    it('should call deleteProductModel method of productService', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(productService, 'deleteProductModel')
        .mockResolvedValueOnce(mockProductModel);
      // when
      const result: void = await controller.deleteModel(mockProductModel.id);
      // then
      expect(result).toBeUndefined();
      expect(spy).nthCalledWith(1, mockProductModel.id);
    });
    it('should throw not found error if Model was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'Model not found',
      );
      jest
        .spyOn(productService, 'deleteProductModel')
        .mockResolvedValueOnce(null);
      // when
      //then
      await expect(controller.deleteModel('2')).rejects.toEqual(expectedError);
    });
  });
});
