import { ApiProperty } from '@nestjs/swagger';

export class Tokens {
  @ApiProperty()
  refresh_token: string;
  @ApiProperty()
  access_token: string;
}
