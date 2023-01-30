import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrdersService } from '../src/orders/orders.service';
import { AppModule } from '../src/app.module';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import { UserJwtPayload } from '../src/user/model/user-jwt-payload';
import { UserRoles } from '../src/user/model/enum/user-roles.enum';
import { UserService } from '../src/user/user.service';
import { createMock } from '@golevelup/ts-jest';
import { User } from '../src/user/schemas';
import { Order } from '../src/orders/schemas/order.schema';
import { CreateOrderDto } from '../src/orders/dto/create-order.dto';
import { ResponseError } from '../src/auth/types';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let ordersService: OrdersService;
  let userService: UserService;
  const user: User = {
    roles: [UserRoles.ADMIN],
    refresh_token: 'token',
    email: 'email',
    id: 'id',
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useValue(createMock<UserService>())
      .overrideProvider(OrdersService)
      .useValue(createMock<OrdersService>())
      .compile();

    app = module.createNestApplication();
    ordersService = module.get<OrdersService>(OrdersService);
    userService = module.get<UserService>(UserService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });
  describe('findAll', () => {
    it('/GET orders should return 401 if user is not found', () => {
      (userService.findById as jest.Mock).mockResolvedValueOnce(null);
      return request(app.getHttpServer())
        .get('/orders')
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.ADMIN)}`,
        )
        .expect((res) =>
          expect(res.body).toMatchObject({
            statusCode: 401,
            message: 'Unauthorized',
            path: '/orders',
          }),
        );
    });
    it('/GET orders should return findAll result', () => {
      (userService.findById as jest.Mock).mockResolvedValueOnce(user);
      (ordersService.findAll as jest.Mock).mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get('/orders')
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.ADMIN)}`,
        )
        .expect((res) => expect(res.body).toEqual([]));
    });
  });
  describe('create', () => {
    it('should return result of create method if user is authorised with 201 status', () => {
      const expectedOrder: Order = {
        user: user.id,
      } as Order;
      const expectCreateDto: CreateOrderDto = { products: [] };
      (userService.findById as jest.Mock).mockResolvedValueOnce(user);
      (ordersService.create as jest.Mock).mockResolvedValueOnce(expectedOrder);
      return request(app.getHttpServer())
        .post('/orders')
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.CUSTOMER)}`,
        )
        .send(expectCreateDto)
        .expect((res) => expect(res.body).toEqual(expectedOrder))
        .expect(() =>
          expect(ordersService.create).toHaveBeenCalledWith(
            expectCreateDto,
            user,
          ),
        );
    });
    it('should return 400 bad request error if create dto is wrong', () => {
      const expectedOrder: Order = {
        user: user.id,
      } as Order;
      const expectedError: ResponseError = {
        message: 'Bad Request Exception',
        path: '/orders',
        statusCode: HttpStatus.BAD_REQUEST,
      };
      const expectCreateDto: CreateOrderDto = { products: null };
      (userService.findById as jest.Mock).mockResolvedValueOnce(user);
      (ordersService.create as jest.Mock).mockResolvedValueOnce(expectedOrder);
      return request(app.getHttpServer())
        .post('/orders')
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.CUSTOMER)}`,
        )
        .send(expectCreateDto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => expect(res.body).toMatchObject(expectedError));
    });
  });
  describe('findOneMy', () => {
    it('should return 404 if order was not found', () => {
      const orderID: string = '63b903c676c4406b99f3d986';
      const expectedError: ResponseError = {
        message: 'Order not found',
        path: `/orders/my/${orderID}`,
        statusCode: HttpStatus.NOT_FOUND,
      };
      (userService.findById as jest.Mock).mockResolvedValueOnce(user);
      (ordersService.findOneMy as jest.Mock).mockResolvedValueOnce(null);
      return request(app.getHttpServer())
        .get(`/orders/my/${orderID}`)
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.CUSTOMER)}`,
        )
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => expect(res.body).toMatchObject(expectedError));
    });
    it('should return 400 if order id is not mongoId', () => {
      const orderID: string = 'notId';
      const expectedError: ResponseError = {
        message: 'Invalid mongoDb id',
        path: `/orders/my/${orderID}`,
        statusCode: HttpStatus.BAD_REQUEST,
      };
      (userService.findById as jest.Mock).mockResolvedValueOnce(user);
      (ordersService.findOneMy as jest.Mock).mockResolvedValueOnce(null);
      return request(app.getHttpServer())
        .get(`/orders/my/${orderID}`)
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.CUSTOMER)}`,
        )
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => expect(res.body).toMatchObject(expectedError))
        .expect(() => expect(ordersService.findOneMy).not.toHaveBeenCalled());
    });
    it('should return order if it was found', () => {
      const orderID: string = '63b903c676c4406b99f3d986';
      (userService.findById as jest.Mock).mockResolvedValueOnce(user);
      (ordersService.findOneMy as jest.Mock).mockResolvedValueOnce({});
      return request(app.getHttpServer())
        .get(`/orders/my/${orderID}`)
        .set(
          'Authorization',
          `Bearer ${authenticatedTokenForRole(UserRoles.CUSTOMER)}`,
        )
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body).toEqual({}))
        .expect(() =>
          expect(ordersService.findOneMy).nthCalledWith(1, user.id, orderID),
        );
    });
  });
});

function authenticatedTokenForRole(role: UserRoles): string {
  const payload: UserJwtPayload = {
    email: 'email',
    id: 'id',
    roles: [role],
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
}
