import { ApiProperty } from '@nestjs/swagger';
import { IProduct } from './product';

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

export class IProductResponse {
  @ApiProperty({
    type: IPagination,
  })
  pagination: IPagination;

  @ApiProperty({
    type: IProduct,
    isArray: true,
  })
  data: IProduct[];
}
