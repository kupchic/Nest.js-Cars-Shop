import { ApiProperty } from '@nestjs/swagger';

export class IProductBrand {
  @ApiProperty()
  brandName: string;

  @ApiProperty()
  brandCountry: string;

  @ApiProperty()
  id: string;
}
