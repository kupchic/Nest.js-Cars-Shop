import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../../user/user.service';
import { createMock } from '@golevelup/ts-jest';
import { User } from '../../user/schemas';
import { UserJwtPayload } from '../../user/model/user-jwt-payload';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import SpyInstance = jest.SpyInstance;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: UserService;
  const mockUser: User = {
    id: 'id',
    email: 'email',
    refresh_token: 'token',
    isBlocked: false,
  } as User;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();
    strategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload: UserJwtPayload = {
      id: mockUser.id,
      email: mockUser.email,
      roles: [],
    };
    it('should return user if user was found, have refreshToken and not blocked', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'findById')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await strategy.validate(payload);
      // then
      expect(result).toBe(mockUser);
      expect(spy).nthCalledWith(1, payload.id);
    });
    it('should throw UnauthorizedException if user was not found', async () => {
      // given
      const expectedError: UnauthorizedException = new UnauthorizedException();
      const spy: SpyInstance = jest
        .spyOn(userService, 'findById')
        .mockResolvedValueOnce(null);
      // when
      // then
      await expect(strategy.validate(payload)).rejects.toEqual(expectedError);
      expect(spy).nthCalledWith(1, payload.id);
    });
    it('should throw UnauthorizedException if user refresh_token was not found', async () => {
      // given
      const expectedError: UnauthorizedException = new UnauthorizedException();
      const spy: SpyInstance = jest
        .spyOn(userService, 'findById')
        .mockResolvedValueOnce({
          ...mockUser,
          refresh_token: null,
        });
      // when
      // then
      await expect(strategy.validate(payload)).rejects.toEqual(expectedError);
      expect(spy).nthCalledWith(1, payload.id);
    });
    it('should throw ForbiddenException if user is blocked', async () => {
      // given
      const expectedError: ForbiddenException = new ForbiddenException(
        'User is blocked',
      );
      const spy: SpyInstance = jest
        .spyOn(userService, 'findById')
        .mockResolvedValueOnce({
          ...mockUser,
          isBlocked: true,
        });
      // when
      // then
      await expect(strategy.validate(payload)).rejects.toEqual(expectedError);
      expect(spy).nthCalledWith(1, payload.id);
    });
  });
});
