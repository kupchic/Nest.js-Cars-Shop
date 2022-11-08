import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { UserJwtPayload } from '../../user/entities/user-jwt-payload';
import { RefreshTokenStrategy } from './refresh-token.strategy';
import { Request } from 'express';
import SpyInstance = jest.SpyInstance;

describe('RefreshTokenStrategy', () => {
  let strategy: RefreshTokenStrategy;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [RefreshTokenStrategy],
    }).compile();
    strategy = module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload: UserJwtPayload = {
      id: 'id',
      email: 'email',
      roles: [],
    };
    it('should return payload + refresh_token if token was extracted from req', async () => {
      // given
      const token: string = 'Bearer refresh_token';
      const mockReq: Request = createMock<Request>();
      const expectedResult: any = {
        ...payload,
        refresh_token: 'refresh_token',
      };
      const spy: SpyInstance = jest.fn().mockReturnValue(token);
      mockReq.get = spy as any;
      // when
      const result: any = await strategy.validate(mockReq, payload);
      // then
      expect(result).toEqual(expectedResult);
      expect(spy).nthCalledWith(1, 'authorization');
    });
    it('should return false if refresh token was not found from req', async () => {
      // given
      const mockReq: Request = createMock<Request>();
      const spy: SpyInstance = jest.fn().mockReturnValue(null);
      mockReq.get = spy as any;
      // when
      const result: any = await strategy.validate(mockReq, payload);
      // then
      expect(result).toEqual(false);
      expect(spy).nthCalledWith(1, 'authorization');
    });
  });
});
