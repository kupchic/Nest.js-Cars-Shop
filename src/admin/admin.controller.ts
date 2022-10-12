import { Controller, Get } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Get()
  admin(): string {
    return 'I am admin';
  }
}
