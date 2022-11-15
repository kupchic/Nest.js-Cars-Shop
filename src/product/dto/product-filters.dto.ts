import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsMongoId } from 'class-validator';
import { BodyTypes } from '../model/enums/body-types.enum';

class ProductFiltersDto {
  @ApiProperty({ description: 'Id of some of existed brand' })
  @IsMongoId()
  productBrand: string;

  @ApiProperty({ description: 'Id of some of existed model' })
  @IsMongoId()
  productModel: string;

  @ApiProperty({ enum: BodyTypes })
  @IsEnum(BodyTypes)
  bodyType: BodyTypes;

  @ApiProperty()
  @IsInt()
  priceFrom: number;

  @ApiProperty()
  @IsInt()
  priceTo: number;
}
