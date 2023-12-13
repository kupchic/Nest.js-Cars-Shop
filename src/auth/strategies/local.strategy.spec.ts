import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../user/schemas';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import SpyInstance = jest.SpyInstance;

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;
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
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();
    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const loginDto: LoginDto = {
      email: mockUser.email,
      password: mockUser.password,
    };
    it('should return user if user was validated', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await strategy.validate(
        mockUser.email,
        mockUser.password,
      );
      // then
      expect(result).toBe(mockUser);
      expect(spy).nthCalledWith(1, loginDto);
    });
    it('should throw UnauthorizedException if user was not found', async () => {
      // given
      const expectedError: UnauthorizedException = new UnauthorizedException();
      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(null);
      // when
      // then
      await expect(
        strategy.validate(mockUser.email, mockUser.password),
      ).rejects.toEqual(expectedError);
    });
    it('should throw ForbiddenException if user is blocked', async () => {
      // given
      const expectedError: ForbiddenException = new ForbiddenException(
        'User is blocked',
      );
      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce({
        ...mockUser,
        isBlocked: true,
      });
      // when
      // then
      await expect(
        strategy.validate(mockUser.email, mockUser.password),
      ).rejects.toEqual(expectedError);
    });
  });
});
