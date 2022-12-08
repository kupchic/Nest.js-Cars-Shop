import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { User } from '../user/schemas';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import { LoginDto } from './dto/login.dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserJwtPayload } from '../user/model/user-jwt-payload';
import { Tokens } from './types/tokens';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';
import { ChangePassDto } from './dto/change-pass.dto';
import * as bcrypt from 'bcrypt';
import { ResetPassDto } from './dto/reset-pass.dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import 'dotenv/config';
import { RegisterDto } from './dto/register.dto';
import { createMock } from '@golevelup/ts-jest';
import SpyInstance = jest.SpyInstance;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UserService;
  let mailService: MailService;
  let jwtService: JwtService;
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
  };

  beforeEach(async () => {
    mockUser.password = await bcrypt.hash('123456', 10);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: MailService,
          useValue: createMock<MailService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if user was found and pass hashes are compare', async () => {
      //given
      const loginDto: LoginDto = {
        email: mockUser.email,
        password: mockUser.password,
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersService, 'comparePasswords').mockResolvedValueOnce(true);
      //when
      const result: User = await service.validateUser(loginDto);
      //then
      expect(result).toEqual(mockUser);
    });

    it('should return ConflictException if user was not found', async () => {
      //given
      const loginDto: LoginDto = {
        email: mockUser.email,
        password: mockUser.password,
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(usersService, 'comparePasswords').mockResolvedValueOnce(false);
      //when
      //then
      await expect(service.validateUser(loginDto)).rejects.toEqual(
        new ConflictException('Incorrect email. Please, try again'),
      );
    });
    it('should return ConflictException if user was found BUT pass hashes are NOT compare', async () => {
      //given
      const loginDto: LoginDto = {
        email: mockUser.email,
        password: mockUser.password,
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersService, 'comparePasswords').mockResolvedValueOnce(false);
      //when
      //then
      await expect(service.validateUser(loginDto)).rejects.toEqual(
        new ConflictException('Wrong password. Please, try again'),
      );
    });
  });

  describe('_generateTokens', () => {
    const methodName: string = '_generateTokens';
    it('should generate token with expected payload', async () => {
      // given
      const expectedPayload: UserJwtPayload = {
        email: mockUser.email,
        id: mockUser.id,
        roles: mockUser.roles,
      };
      const accessTokenExpectedOptions: JwtSignOptions = {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE,
      };
      const refreshTokenExpectedOptions: JwtSignOptions = {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      };
      const expectedTokens: Tokens = {
        refresh_token: 'test',
        access_token: 'test',
      };
      const jwtSignSpy: SpyInstance = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('test');
      //when
      const tokens: Tokens = await service[methodName](mockUser);
      //then
      expect(tokens).toEqual(expectedTokens);
      expect(jwtSignSpy).toHaveBeenCalledTimes(2);
      expect(jwtSignSpy.mock.calls[0]).toEqual([
        expectedPayload,
        accessTokenExpectedOptions,
      ]);
      expect(jwtSignSpy.mock.calls[1]).toEqual([
        expectedPayload,
        refreshTokenExpectedOptions,
      ]);
    });
    it('should catch error', async () => {
      // given
      const expectedError: Error = new Error('error');
      jest.spyOn(jwtService, 'sign').mockImplementation(() => {
        throw expectedError;
      });
      //when
      //then
      await expect(service[methodName](mockUser)).rejects.toEqual(
        expectedError,
      );
    });
  });

  describe('login', () => {
    it('should update user refresh token and return tokens', async () => {
      // given
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      const expectedTokens: Tokens = {
        refresh_token: 'token',
        access_token: 'token',
      };
      const { access_token, ...a } = expectedTokens;
      const spy: SpyInstance = jest.spyOn(usersService, 'partialUserUpdate');
      // when
      const result: Tokens = await service.login(mockUser);
      // then
      expect(result).toEqual(expectedTokens);
      expect(spy).nthCalledWith(1, mockUser.id, a);
    });
    it('should catch error', async () => {
      // given
      jest
        .spyOn(usersService, 'partialUserUpdate')
        .mockRejectedValueOnce(new ConflictException());
      // when
      // then
      await expect(service.login(mockUser)).rejects.toEqual(
        new ConflictException(),
      );
    });
  });

  describe('logout', () => {
    it('should set user refresh token to null when successfully logout', async () => {
      // given
      const partialUpdate: any = {
        refresh_token: null,
      };

      // when
      const result: void = await service.logout(mockUser.id);
      // then
      expect(usersService.partialUserUpdate).toHaveBeenNthCalledWith(
        1,
        mockUser.id,
        partialUpdate,
      );
      expect(result).toBeUndefined();
    });
    it('should catch error', async () => {
      // given
      jest
        .spyOn(usersService, 'partialUserUpdate')
        .mockRejectedValueOnce(new ConflictException());
      // when
      // then
      await expect(service.logout(mockUser.id)).rejects.toEqual(
        new ConflictException(),
      );
    });
  });
  describe('changePassword', () => {
    it('should throw error when old password is wrong', async () => {
      // given
      const changePassDto: ChangePassDto = {
        oldPassword: userPass + 1,
        newPassword: '222',
        repeatNewPassword: '222',
      };
      const expectedError: ForbiddenException = new ForbiddenException(
        'Wrong old password',
      );
      // when
      // then
      await expect(
        service.changePassword(changePassDto, mockUser),
      ).rejects.toEqual(expectedError);
    });
    it('should throw error when new password compare to old password', async () => {
      // given
      const changePassDto: ChangePassDto = {
        oldPassword: userPass,
        newPassword: userPass,
        repeatNewPassword: userPass,
      };
      const expectedError: ForbiddenException = new ConflictException(
        'New password should not match the current',
      );
      // when
      // then
      await expect(
        service.changePassword(changePassDto, mockUser),
      ).rejects.toEqual(expectedError);
    });
    it('should update user password and refresh token', async () => {
      // given
      const changePassDto: ChangePassDto = {
        oldPassword: userPass,
        newPassword: userPass + 1,
        repeatNewPassword: userPass + 1,
      };
      jest.spyOn(jwtService, 'sign').mockReturnValue('test');
      const expectedTokens: Tokens = {
        refresh_token: 'test',
        access_token: 'test',
      };

      // when
      const res: Tokens = await service.changePassword(changePassDto, mockUser);
      // then
      expect(res).toEqual(expectedTokens);
      expect(usersService.partialUserUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetUserPassword', () => {
    const resetPassDto: ResetPassDto = {
      password: '12345',
      confirmPassword: '12345',
    };
    it('should throw NotFoundException if user was not found by id', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'User is not found',
      );
      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(null);
      // when
      // then
      await expect(
        service.resetUserPassword(resetPassDto, mockUser.id, '1'),
      ).rejects.toEqual(expectedError);
    });
    it('should throw ConflictException if link is expired', async () => {
      // given
      const expectedError: HttpException = new ConflictException(
        'The password reset link is no longer valid',
      );
      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      // when
      // then
      await expect(
        service.resetUserPassword(resetPassDto, mockUser.id, '1'),
      ).rejects.toEqual(expectedError);
    });
    it('should throw ConflictException if new password match the current', async () => {
      // given
      const expectedError: HttpException = new ConflictException(
        'New password should not match the current',
      );
      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersService, 'comparePasswords').mockResolvedValueOnce(true);
      // when
      // then
      await expect(
        service.resetUserPassword(
          { ...resetPassDto, password: userPass },
          mockUser.id,
          '1',
        ),
      ).rejects.toEqual(expectedError);
    });

    it('should update userPass if new password does not match the current', async () => {
      // given
      const expectedUpdate: any = { password: 'password' };
      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersService, 'comparePasswords').mockResolvedValueOnce(false);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce(expectedUpdate.password as never);
      // when
      const result: void = await service.resetUserPassword(
        resetPassDto,
        mockUser.id,
        '1',
      );
      // then
      expect(result).toBeUndefined();
      expect(usersService.partialUserUpdate).nthCalledWith(
        1,
        mockUser.id,
        expectedUpdate,
      );
      expect(bcrypt.hash).nthCalledWith(1, resetPassDto.password, 10);
    });
  });

  describe('resetPassSendLink', () => {
    it('should return ConflictException if user was not found with email', async () => {
      // given
      const expectedError: HttpException = new ConflictException(
        'Incorrect email. Please, try again',
      );
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);
      // when
      // then
      await expect(service.resetPassSendLink(mockUser.email)).rejects.toEqual(
        expectedError,
      );
    });
    it('should call sendResetPassLink method of mailService with expected link and user data', async () => {
      // given
      const mockToken: string = 'token';
      const expectedLink: string = `http://localhost:5000/auth/reset-password/${mockUser.id}/${mockToken}`;
      const jwtSignSpy: SpyInstance = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue(mockToken);
      const expectedSignArgs: any[] = [
        {
          email: mockUser.email,
          id: mockUser.id,
        },
        {
          expiresIn: '15m',
          secret: `${process.env.JWT_SECRET}${mockUser.id}${mockUser.password}`,
        },
      ];
      jest
        .spyOn(mailService, 'sendResetPassLink')
        .mockResolvedValueOnce(undefined);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);
      // when
      const result: void = await service.resetPassSendLink(mockUser.email);
      // then
      expect(result).toBeUndefined();
      expect(jwtSignSpy).toHaveBeenNthCalledWith(1, ...expectedSignArgs);
      expect(mailService.sendResetPassLink).toHaveBeenNthCalledWith(
        1,
        mockUser,
        expectedLink,
      );
    });
  });
  describe('refreshTokens', () => {
    describe('should return ForbiddenException if', () => {
      const error: ForbiddenException = new ForbiddenException('Access Denied');
      it('user was not found', async () => {
        // given
        jest.spyOn(usersService, 'findById').mockResolvedValueOnce(null);
        // when
        // then
        await expect(
          service.refreshTokens(mockUser.id, 'test'),
        ).rejects.toEqual(error);
      });
      it('user refresh token is null', async () => {
        // given
        jest
          .spyOn(usersService, 'findById')
          .mockResolvedValueOnce({ ...mockUser, refresh_token: null });
        // when
        // then
        await expect(
          service.refreshTokens(mockUser.id, 'test'),
        ).rejects.toEqual(error);
      });
      it('user refresh token is not equal to request refresh token', async () => {
        // given
        jest
          .spyOn(usersService, 'findById')
          .mockResolvedValueOnce({ ...mockUser, refresh_token: 'test3' });
        // when
        // then
        await expect(
          service.refreshTokens(mockUser.id, 'test'),
        ).rejects.toEqual(error);
      });
    });
    it('should returns tokens if user refresh token is equal to request refresh token and update user refresh_token', async () => {
      // given
      const expectedTokens: Tokens = {
        refresh_token: 'token',
        access_token: 'token',
      };
      jest
        .spyOn(usersService, 'findById')
        .mockResolvedValueOnce({ ...mockUser, refresh_token: 'test' });

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue(expectedTokens.access_token);
      // when
      const result: Tokens = await service.refreshTokens(mockUser.id, 'test');
      // then
      expect(result).toEqual(expectedTokens);
      expect(usersService.partialUserUpdate).nthCalledWith(1, mockUser.id, {
        refresh_token: expectedTokens.refresh_token,
      });
    });
  });
  describe('registerUser', () => {
    it('should call register method from userService', async () => {
      // given
      const registerDto: RegisterDto = {
        ...mockUser,
        confirmPassword: '',
      };
      // when
      await service.registerUser(registerDto);
      // then
      expect(usersService.registerUser).toHaveBeenNthCalledWith(1, registerDto);
    });
  });
});
