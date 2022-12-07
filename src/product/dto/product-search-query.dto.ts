import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { OrderByEnum } from '../../common/model';
import { Type } from 'class-transformer';

export class ProductSearchQueryDto {
  @ApiProperty({ enum: OrderByEnum, required: false })
  @ValidateIf((dto: ProductSearchQueryDto) => !!dto.sortBy)
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiProperty({ description: 'Id of some of existed brand', required: false })
  @ValidateIf((dto: ProductSearchQueryDto) => !!dto.orderBy)
  @IsNotEmpty()
  sortBy?: string;

  @ApiProperty({
    description: 'from 1 to 100. By default is 20',
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: string;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string;
}
