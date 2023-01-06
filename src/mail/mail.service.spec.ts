import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailOptions } from 'nodemailer';
import { User } from '../user/schemas';
import { UserRoles } from '../user/model/enum/user-roles.enum';
import { ConflictException } from '@nestjs/common';
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
});
