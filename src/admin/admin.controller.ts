import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin module')
@Controller('admin')
export class AdminController {
  @Get()
  admin(): string {
    return 'I am admin';
  }
}
