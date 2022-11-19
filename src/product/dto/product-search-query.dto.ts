import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { OrderByEnum } from '../../common/model';

export class ProductSearchQueryDto {
  @ApiProperty({ enum: OrderByEnum })
  @ValidateIf((dto: ProductSearchQueryDto) => !!dto.sortBy)
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiProperty({ description: 'Id of some of existed brand' })
  @ValidateIf((dto: ProductSearchQueryDto) => !!dto.orderBy)
  @IsNotEmpty()
  sortBy?: string;

  @ApiProperty({ description: 'from 1 to 100. By default is 20' })
  @IsNumberString()
  @Max(100)
  @Min(1)
  @IsOptional()
  pageSize?: string;

  @ApiProperty()
  @IsNumberString()
  @Min(1)
  @IsOptional()
  page?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string;
}
