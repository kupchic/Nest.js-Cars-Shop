import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import 'dotenv/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_ETHEREAL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_ETHEREAL,
          pass: process.env.MAIL_ETHEREAL_PASS,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
      template: {
        dir: join(process.cwd(), 'src/mail/templates'),
        adapter: new HandlebarsAdapter({
          // Function to do basic mathematical operation in handlebar
          math: function (lvalue, operator, rvalue): void {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
              '+': lvalue + rvalue,
              '-': lvalue - rvalue,
              '*': lvalue * rvalue,
              '/': lvalue / rvalue,
              '%': lvalue % rvalue,
            }[operator];
          },
        }),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
