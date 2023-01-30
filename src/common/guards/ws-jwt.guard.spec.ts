import { ExecutionContext } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';
import { AuthService } from '../../auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { User } from '../../user/schemas';
import { UserRoles } from '../../user/model/enum/user-roles.enum';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let authService: AuthService;
  const mockUser: User = {
    id: 'mock',
    password: '1234',
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
  const getClientMock: jest.Mock = jest.fn();
  const context: ExecutionContext = {
    switchToWs(): any {
      return {
        getClient: getClientMock,
      };
    },
  } as ExecutionContext;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    guard = new WsJwtGuard(authService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if user was verified by access_token form auth, logined and not blocked', async () => {
      // given
      const mockToken: string = 'token';
      getClientMock.mockReturnValue({
        handshake: {
          auth: {
            auth_token: mockToken,
          },
          headers: {},
        },
      });
      jest
        .spyOn(authService, 'verifyUserWithJwtPayload')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: boolean = await guard.canActivate(context);

      // then
      expect(result).toBeTruthy();
      expect(authService.verifyUserWithJwtPayload).nthCalledWith(1, mockToken);
    });
    it('should return false if user was not found and disconnect client', async () => {
      // given
      const disconnectSpy: jest.SpyInstance = jest.fn();
      const mockToken: string = 'token from headers';
      getClientMock.mockReturnValue({
        handshake: {
          headers: {
            auth_token: mockToken,
          },
          auth: {},
        },
        disconnect: disconnectSpy,
      });
      jest
        .spyOn(authService, 'verifyUserWithJwtPayload')
        .mockResolvedValueOnce(null);
      // when
      const result: boolean = await guard.canActivate(context);

      // then
      expect(result).toBeFalsy();
      expect(disconnectSpy).nthCalledWith(1, true);
      expect(authService.verifyUserWithJwtPayload).nthCalledWith(1, mockToken);
    });
    it('should return false if user was found but he is blocked and disconnect client', async () => {
      // given
      const disconnectSpy: jest.SpyInstance = jest.fn();
      const mockToken: string = 'token from headers';
      getClientMock.mockReturnValue({
        handshake: {
          headers: {
            auth_token: mockToken,
          },
          auth: {},
        },
        disconnect: disconnectSpy,
      });
      jest
        .spyOn(authService, 'verifyUserWithJwtPayload')
        .mockResolvedValueOnce({ ...mockUser, isBlocked: true });
      // when
      const result: boolean = await guard.canActivate(context);

      // then
      expect(result).toBeFalsy();
      expect(disconnectSpy).nthCalledWith(1, true);
      expect(authService.verifyUserWithJwtPayload).nthCalledWith(1, mockToken);
    });
  });
});
