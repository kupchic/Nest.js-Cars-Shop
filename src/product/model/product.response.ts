import { ApiProperty } from '@nestjs/swagger';
import { IPaginatedResponse } from '../../common/model';
import { IProduct } from './product';

export class IPaginatedProductResponse extends IPaginatedResponse<IProduct> {
  @ApiProperty({
    type: IProduct,
    isArray: true,
  })
  data: IProduct[];
}
