import { ApiProperty } from '@nestjs/swagger';

export class ProductCart {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId;
}
