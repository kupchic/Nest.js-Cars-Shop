import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { SendMailOptions } from 'nodemailer';
import { User } from '../user/schemas';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import { ConflictException, Logger } from '@nestjs/common';
import { Order } from '../orders/schemas/order.schema';
import {
  ORDER_STATUSES,
  OrderStatus,
} from '../orders/model/enums/order-status';
import SpyInstance = jest.SpyInstance;

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
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
  const mockOrder: Order = {
    status: OrderStatus.IN_PROGRESS,
    updatedAt: new Date().toString(),
  } as Order;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sendResetPassLink', () => {
    it('should call sendMail method from mailerService with expectedConfig', async () => {
      // given
      const url: string = 'example.com';
      const expectedConfig: SendMailOptions = {
        to: mockUser.email,
        subject: 'Reset Password',
        template: './reset-pass',
        context: {
          name: mockUser.firstName,
          url,
        },
      } as any;
      const spy: SpyInstance = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValueOnce('sent');
      // when
      const result: void = await service.sendResetPassLink(mockUser, url);
      // then
      expect(result).toBeUndefined();
      expect(spy).nthCalledWith(1, expectedConfig);
    });
    it('should throw error', async () => {
      // given
      const expectedError: ConflictException = new ConflictException(
        'Something went wrong when sending email. Try again',
      );
      const url: string = 'example.com';
      const expectedConfig: ISendMailOptions = {
        to: mockUser.email,
        subject: 'Reset Password',
        template: './reset-pass',
        context: {
          name: mockUser.firstName,
          url,
        },
      };
      const spy: SpyInstance = jest
        .spyOn(mailerService, 'sendMail')
        .mockImplementationOnce(() => {
          throw expectedError;
        });
      // when
      // then
      await expect(service.sendResetPassLink(mockUser, url)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, expectedConfig);
    });
  });
  describe('orderNotice', () => {
    it('should call sendMail method from mailerService with expectedConfig for new order', async () => {
      // given
      const expectedConfig: ISendMailOptions = {
        to: mockUser.email,
        subject: `Thanks for order, ${mockUser.firstName}. Order #${mockOrder.orderNo}`,
        template: './created-order',
        context: {
          order: mockOrder,
          status: ORDER_STATUSES[mockOrder.status],
          updatedAt: new Date(mockOrder.updatedAt).toLocaleDateString(),
        },
      };
      const spy: SpyInstance = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValueOnce('sent');
      // when
      const result: void = await service.orderNotice(mockUser, mockOrder, true);
      // then
      expect(result).toBeUndefined();
      expect(spy).nthCalledWith(1, expectedConfig);
    });
    it('should call sendMail method from mailerService with expectedConfig for order update', async () => {
      // given
      const expectedConfig: ISendMailOptions = {
        to: mockUser.email,
        subject: `Hi ${mockUser.firstName}. The order #${
          mockOrder.orderNo
        } is ${ORDER_STATUSES[mockOrder.status]}`,
        template: './created-order',
        context: {
          order: mockOrder,
          status: ORDER_STATUSES[mockOrder.status],
          updatedAt: new Date(mockOrder.updatedAt).toLocaleDateString(),
        },
      };
      const spy: SpyInstance = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValueOnce('sent');
      // when
      const result: void = await service.orderNotice(mockUser, mockOrder);
      // then
      expect(result).toBeUndefined();
      new Logger('Test').log(spy.mock.calls);
      expect(spy).nthCalledWith(1, expectedConfig);
    });
    it('should throw error', async () => {
      // given
      const expectedError: ConflictException = new ConflictException(
        'Something went wrong when sending email. Try again',
      );
      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(() => {
        throw expectedError;
      });
      // when
      // then
      await expect(service.orderNotice(mockUser, {} as Order)).rejects.toEqual(
        expectedError,
      );
    });
  });
});
