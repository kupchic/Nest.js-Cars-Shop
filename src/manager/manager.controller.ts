import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Manager Module')
@Controller('manager')
export class ManagerController {
  @Get()
  get(): string {
    return 'I am manager';
  }
}
