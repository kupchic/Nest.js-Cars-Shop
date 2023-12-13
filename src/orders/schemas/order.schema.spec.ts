import { orderPreFindOneAndUpdateHook, orderPreSaveHook } from './order.schema';
import { ModelName, PRODUCT_POPULATE_OPTIONS } from '../../common/model';
import {
  PRODUCT_CART_SIZE_LIMIT,
  PRODUCT_CART_SIZE_LIMIT_ERROR,
} from '../../product/model/consts/product-cart-size-limit';
import { ConflictException } from '@nestjs/common';

describe('OrderSchema', () => {
  const mNext: jest.Mock = jest.fn();
  const updateOneMock: jest.Mock = jest.fn();
  const findOneAndUpdateMock: jest.Mock = jest.fn();
  const getTotalSumMock: jest.Mock = jest.fn();
  const countDocumentsMock: jest.Mock = jest.fn();
  const populateMock: jest.Mock = jest.fn();
  const getUpdateMock: jest.Mock = jest.fn();
  const setUpdateMock: jest.Mock = jest.fn();
  let context: any;
  beforeEach(() => {
    jest.clearAllMocks();
    context = {
      model: {
        getTotalSum: getTotalSumMock,
      },
      $model: jest.fn().mockImplementation(() => ({
        updateOne: updateOneMock,
        findOneAndUpdate: findOneAndUpdateMock,
        getTotalSum: getTotalSumMock,
        countDocuments: countDocumentsMock,
      })),
      getUpdate: getUpdateMock,
      setUpdate: setUpdateMock,
      populate: populateMock,
    };
  });
  describe('orderPreSaveHook', () => {
    it('should add expected fields, empty product cart of user and execute next middleware if product', async () => {
      // given
      const totalSum: number = 20;
      const orderId: number = 1;
      const userId: number = 2;
      getTotalSumMock.mockReturnValueOnce(totalSum);
      countDocumentsMock.mockReturnValueOnce(totalSum - 1);
      // when
      context.id = orderId;
      context.user = userId;
      await orderPreSaveHook.call(context, mNext);
      // then
      expect(context.totalAmount).toEqual(0);
      expect(context.$model).toHaveBeenCalledWith(ModelName.ORDER);
      expect(context.totalSum).toEqual(totalSum);
      expect(context.orderNo).toEqual(totalSum - 1);
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: userId },
        { $push: { orders: orderId } },
      );
      expect(context.$model).toHaveBeenCalledWith(ModelName.PRODUCT_CART);
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { user: userId },
        { $set: { products: [] } },
      );
      expect(mNext).toBeCalledTimes(1);
    });
    it('should throw error if products length greater than PRODUCT_CART_SIZE_LIMIT', async () => {
      // given
      context.products = new Array(PRODUCT_CART_SIZE_LIMIT + 1);
      // when
      // then
      await expect(orderPreSaveHook.call(context, mNext)).rejects.toEqual(
        new ConflictException(PRODUCT_CART_SIZE_LIMIT_ERROR),
      );
    });
  });
  describe('orderPreFindOneAndUpdateHook', () => {
    it('should populate products with populate options and add to update totalAmount and sum fields', async () => {
      // given
      const totalSum: number = 20;
      const products: any[] = [1];

      getUpdateMock.mockReturnValueOnce({ products });
      getTotalSumMock.mockResolvedValueOnce(totalSum);
      // when
      await orderPreFindOneAndUpdateHook.call(context, mNext);
      // then
      expect(populateMock).nthCalledWith(1, [
        'user',
        {
          path: 'products.product',
          populate: PRODUCT_POPULATE_OPTIONS,
        },
      ]);
      expect(getTotalSumMock).nthCalledWith(1, products);
      expect(setUpdateMock).nthCalledWith(1, {
        $set: {
          totalAmount: products.length,
          totalSum: totalSum,
        },
      });
    });
    it('should only populate order without setting update if no products in update', async () => {
      // given
      // when
      getUpdateMock.mockReturnValue({});
      // then
      await orderPreFindOneAndUpdateHook.call(context, mNext);
      expect(mNext).toHaveBeenCalled();
      expect(populateMock).toHaveBeenCalled();
      expect(setUpdateMock).not.toHaveBeenCalled();
    });
    it('should throw error if products length greater than PRODUCT_CART_SIZE_LIMIT', async () => {
      // given
      const products: any[] = new Array(PRODUCT_CART_SIZE_LIMIT + 1);
      // when
      getUpdateMock.mockReturnValue({ products: products });
      // then
      await expect(
        orderPreFindOneAndUpdateHook.call(context, mNext),
      ).rejects.toEqual(new ConflictException(PRODUCT_CART_SIZE_LIMIT_ERROR));
      expect(mNext).not.toHaveBeenCalled();
      expect(populateMock).not.toHaveBeenCalled();
      expect(setUpdateMock).not.toHaveBeenCalled();
    });
  });
});
