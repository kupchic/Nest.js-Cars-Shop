import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetPassLink(user: User, token: string): Promise<any> {
    const url: string = `http://localhost:5000/auth/reset-password?token=${token}`;
    return this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: './reset-pass',
      context: {
        name: user.firstName,
        url,
      },
    });
  }
}
