import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customer module')
@Controller('customer')
export class CustomerController {
  @Get()
  get(): string {
    return 'I am customer';
  }
}