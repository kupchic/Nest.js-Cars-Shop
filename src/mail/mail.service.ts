import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../user/schemas';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetPassLink(user: User, url: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset Password',
        template: './reset-pass',
        context: {
          name: user.firstName,
          url,
        },
      });
    } catch (e) {
      throw new ConflictException(
        'Something went wrong when sending email. Try again',
      );
    }
  }

  async sendCreatedOrder(user: User, order: Order): Promise<void> {
    try {
      console.log(order);
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'New order from you, ' + user.firstName,
        template: './created-order',
        context: {
          name: user.firstName,
          order,
        },
      });
    } catch (e) {
      throw new ConflictException(
        'Something went wrong when sending email. Try again',
      );
    }
  }
}
