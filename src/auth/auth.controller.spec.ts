import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/schemas';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/tokens';
import { ChangePassDto } from './dto/change-pass.dto';
import { ResetPassDto } from './dto/reset-pass.dto';
import { createMock } from '@golevelup/ts-jest';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  const userPass: string = '123456';
  const mockUser: User = {
    id: 'mock',
    password: userPass,
    email: 'mock@gmail.com',
    roles: [UserRoles.CUSTOMER],
    refresh_token: 'some',
    firstName: 'Alex',
    lastName: 'Tester',
    phone: '8029',
    isBlocked: false,
    cart: 's',
    orders: [],
  };
  beforeEach(async () => {
    mockUser.password = await bcrypt.hash('123456', 10);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('register', () => {
    it('should call registerMethod and return void if successfully', async () => {
      // given
      const regDto: RegisterDto = {
        ...mockUser,
        confirmPassword: mockUser.password,
      };
      jest.spyOn(authService, 'registerUser').mockResolvedValueOnce(undefined);
      // when
      const result: void = await controller.register(regDto);
      // then
      expect(authService.registerUser).toHaveBeenNthCalledWith(1, regDto);
      expect(result).toBeUndefined();
    });
  });
  describe('login', () => {
    it('should call login and return tokens if successfully', async () => {
      // given
      const tokens: Tokens = {
        refresh_token: 't',
        access_token: 't',
      };
      jest.spyOn(authService, 'login').mockResolvedValueOnce(tokens);
      // when
      const result: Tokens = await controller.login(mockUser);
      // then
      expect(authService.login).toHaveBeenNthCalledWith(1, mockUser);
      expect(result).toEqual(tokens);
    });
  });
  describe('logout', () => {
    it('should call logout and return void if successfully', async () => {
      // given
      jest.spyOn(authService, 'logout').mockResolvedValueOnce(undefined);
      // when
      const result: void = await controller.logout(mockUser.id);
      // then
      expect(authService.logout).toHaveBeenNthCalledWith(1, mockUser.id);
      expect(result).toBeUndefined();
    });
  });
  describe('change-password', () => {
    it('should call changePassword method and return void if successfully', async () => {
      // given
      const tokens: Tokens = {
        refresh_token: 't',
        access_token: 't',
      };
      const dto: ChangePassDto = {
        oldPassword: '123',
        newPassword: '12345',
        repeatNewPassword: '12345',
      };
      jest.spyOn(authService, 'changePassword').mockResolvedValueOnce(tokens);
      // when
      const result: Tokens = await controller.changePassword(dto, mockUser);
      // then
      expect(authService.changePassword).toHaveBeenNthCalledWith(
        1,
        dto,
        mockUser,
      );
      expect(result).toEqual(tokens);
    });
  });
  describe('refresh-tokens', () => {
    it('should call refreshTokens method and return void if successfully', async () => {
      // given
      const tokens: Tokens = {
        refresh_token: 't',
        access_token: 't',
      };
      jest.spyOn(authService, 'refreshTokens').mockResolvedValueOnce(tokens);
      // when
      const result: Tokens = await controller.refreshTokens(
        mockUser.id,
        mockUser.refresh_token,
      );
      // then
      expect(authService.refreshTokens).toHaveBeenNthCalledWith(
        1,
        mockUser.id,
        mockUser.refresh_token,
      );
      expect(result).toEqual(tokens);
    });
  });
  describe('reset-password', () => {
    it('should call resetUserPassword method and return void if successfully', async () => {
      // given
      const dto: ResetPassDto = {
        password: 'srt',
        confirmPassword: 'srt',
      };
      jest
        .spyOn(authService, 'resetUserPassword')
        .mockResolvedValueOnce(undefined);
      // when
      const result: void = await controller.resetUserPassword(dto, {
        id: mockUser.id,
        token: mockUser.refresh_token,
      });
      // then
      expect(authService.resetUserPassword).toHaveBeenNthCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.refresh_token,
      );
      expect(result).toBeUndefined();
    });
  });
  describe('forgot-password', () => {
    it('should call resetPassSendLink method and return void if successfully', async () => {
      // given
      jest
        .spyOn(authService, 'resetPassSendLink')
        .mockResolvedValueOnce(undefined);
      // when
      const result: void = await controller.sendLink(mockUser.email);
      // then
      expect(authService.resetPassSendLink).toHaveBeenNthCalledWith(
        1,
        mockUser.email,
      );
      expect(result).toBeUndefined();
    });
  });
});
