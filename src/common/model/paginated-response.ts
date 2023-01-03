import { ApiProperty } from '@nestjs/swagger';
import { IPagination } from './pagination';

export class IPaginatedResponse<T> {
  @ApiProperty({
    type: IPagination,
  })
  pagination: IPagination;

  @ApiProperty({
    isArray: true,
  })
  data: T[];
}
