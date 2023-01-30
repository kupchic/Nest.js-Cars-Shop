import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { OrdersGateway } from './orders.gateway';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../user/schemas';
import { UserRoles } from '../user/model/enum/user-roles.enum';

describe('OrdersGateway', () => {
  let service: OrdersGateway;
  let authService: AuthService;
  const mockServerCallback: jest.Mock = jest.fn();
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
  const mockServer: Server = {
    use: mockServerCallback as any,
  } as Server;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersGateway,
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    service = module.get<OrdersGateway>(OrdersGateway);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('afterInit', () => {
    const mockToken: string = 'token';
    const nextMockFn: jest.Mock = jest.fn();

    it('should next with error if userVerify passed with error', async () => {
      service.afterInit(mockServer);
      const fn: any = mockServerCallback.mock.calls[0][0];
      fn({}, nextMockFn);
      expect(mockServerCallback).nthCalledWith(1, expect.any(Function));
      expect(nextMockFn).nthCalledWith(1, new ForbiddenException());
    });
    it('should next without error if user was found', async () => {
      service.afterInit(mockServer);
      (authService.verifyUserWithJwtPayload as jest.Mock).mockResolvedValueOnce(
        mockUser,
      );
      const fn: any = mockServerCallback.mock.calls[0][0];
      fn(
        {
          handshake: {
            auth: {
              auth_token: mockToken,
            },
            headers: {},
          },
        },
        nextMockFn,
      );
      expect(mockServerCallback).nthCalledWith(1, expect.any(Function));
      expect(authService.verifyUserWithJwtPayload).nthCalledWith(1, mockToken);
      setTimeout(() => {
        expect(nextMockFn).nthCalledWith(1);
      });
    });
    it('should next with error if user was not found', async () => {
      service.afterInit(mockServer);
      (authService.verifyUserWithJwtPayload as jest.Mock).mockResolvedValueOnce(
        null,
      );
      const fn: any = mockServerCallback.mock.calls[0][0];
      fn(
        {
          handshake: {
            auth: {},
            headers: {
              auth_token: mockToken,
            },
          },
        },
        nextMockFn,
      );
      expect(mockServerCallback).nthCalledWith(1, expect.any(Function));
      expect(authService.verifyUserWithJwtPayload).nthCalledWith(1, mockToken);
      setTimeout(() => {
        expect(nextMockFn).nthCalledWith(1, new ForbiddenException());
      });
    });
    it('should next with error if user is blocked', async () => {
      service.afterInit(mockServer);
      (authService.verifyUserWithJwtPayload as jest.Mock).mockResolvedValueOnce(
        { ...mockUser, isBlocked: true },
      );
      const fn: any = mockServerCallback.mock.calls[0][0];
      fn(
        {
          handshake: {
            auth: {},
            headers: {
              auth_token: mockToken,
            },
          },
        },
        nextMockFn,
      );
      expect(mockServerCallback).nthCalledWith(1, expect.any(Function));
      expect(authService.verifyUserWithJwtPayload).nthCalledWith(1, mockToken);
      setTimeout(() => {
        expect(nextMockFn).nthCalledWith(1, new ForbiddenException());
      });
    });
  });
});
