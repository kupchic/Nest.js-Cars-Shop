import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { BodyTypes } from '../model/enums/body-types.enum';

export class ProductFiltersDto {
  @ApiProperty({ description: 'Id of some of existed brand' })
  @IsMongoId()
  @IsOptional()
  productBrand?: string;

  @ApiProperty({ description: 'Id of some of existed model' })
  @IsMongoId()
  @IsOptional()
  productModel?: string;

  @ApiProperty({ enum: BodyTypes })
  @IsEnum(BodyTypes)
  @IsOptional()
  bodyType?: BodyTypes;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  priceFrom?: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  priceTo?: number;
}
