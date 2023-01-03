import { ApiProperty } from '@nestjs/swagger';

export class IPagination {
  @ApiProperty()
  totalRecords: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  pageCount: number;
}
