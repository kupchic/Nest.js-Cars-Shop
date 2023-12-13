import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../user/schemas';
import { Order } from '../orders/schemas/order.schema';
import 'dotenv/config';
import { ORDER_STATUSES } from '../orders/model/enums/order-status';

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

  async orderNotice(
    user: User,
    order: Order,
    isNew: boolean = false,
  ): Promise<void> {
    try {
      const status: string = ORDER_STATUSES[order.status];
      const result: any = await this.mailerService.sendMail({
        to: user.email,
        subject: isNew
          ? `Thanks for order, ${user.firstName}. Order #${order.orderNo}`
          : `Hi ${user.firstName}. The order #${order.orderNo} is ${status}`,
        template: './created-order',
        context: {
          order,
          status,
          updatedAt: new Date(order.updatedAt).toLocaleDateString(),
        },
      });
    } catch (e) {
      throw new ConflictException(
        'Something went wrong when sending email. Try again',
      );
    }
  }
}
