import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { User } from '../user/user.schema';
import { UserRoles } from '../user/entities/user-roles.enum';
import { LoginDto } from './dto/login.dto';
import { ConflictException } from '@nestjs/common';
import { UserJwtPayload } from '../user/entities/user-jwt-payload';
import { Tokens } from './types/tokens';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';
import SpyInstance = jest.SpyInstance;

fdescribe('AuthService', () => {
  let service: AuthService;
  let usersService: UserService;
  let mailService: MailService;
  let configService: ConfigService;
  let jwtService: JwtService;
  const mockUser: User = {
    id: 'mock',
    password: '123456',
    email: 'mock@gmail.com',
    roles: [UserRoles.CUSTOMER],
    refresh_token: 'some',
    firstName: 'Alex',
    lastName: 'Tester',
    phone: '8029',
    isBlocked: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        { provide: MailService, useValue: {} },
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            comparePasswords: jest.fn(),
            partialUserUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
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
      const configValue: string = 'test';
      const expectedOptions: JwtSignOptions = {
        secret: configValue,
        expiresIn: configValue,
      };
      const expectedConfigGets: string[] = [
        'JWT_SECRET',
        'JWT_EXPIRE',
        'REFRESH_TOKEN_SECRET',
        'REFRESH_TOKEN_EXPIRATION',
      ];
      const jwtSignSpy: SpyInstance = jest.spyOn(jwtService, 'sign');
      const configSpy: SpyInstance = jest
        .spyOn(configService, 'get')
        .mockReturnValue(configValue);
      //when
      const tokens: Tokens = await service[methodName](mockUser);
      //then
      expect(tokens).toEqual({});
      expect(jwtSignSpy).toHaveBeenCalledTimes(2);
      expect(jwtSignSpy.mock.calls[0]).toEqual([
        expectedPayload,
        expectedOptions,
      ]);
      expect(jwtSignSpy.mock.calls[1]).toEqual([
        expectedPayload,
        expectedOptions,
      ]);
      expect(configSpy).toHaveBeenCalledTimes(expectedConfigGets.length);
      expect(configSpy.mock.calls).toEqual(
        expectedConfigGets.map((v: string) => [v]),
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
      const result: Tokens = await service.login(mockUser);
      // then
      expect(result).toEqual(new ConflictException());
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
      const result: any = await service.logout(mockUser.id);
      // then
      expect(result).toEqual(new ConflictException());
    });
  });
});
