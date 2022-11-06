import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailOptions } from 'nodemailer';
import { User } from '../user/user.schema';
import { UserRoles } from '../user/entities/user-roles.enum';
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
      const result: any = await service.sendResetPassLink(mockUser, url);
      // then
      expect(result).toEqual('sent');
      expect(spy).nthCalledWith(1, expectedConfig);
    });
  });
});
