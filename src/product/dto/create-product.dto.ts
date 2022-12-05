import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  PRODUCT_PRICE_MAX_VALUE,
  PRODUCT_PRICE_MIN_VALUE,
  PRODUCT_WARRANTY_MAX_VALUE,
  PRODUCT_WARRANTY_MIN_VALUE,
  PRODUCT_YEAR_OF_ISSUE_MAX_VALUE,
  PRODUCT_YEAR_OF_ISSUE_MIN_VALUE,
  ProductColors,
} from '../model';

export class CreateProductDto {
  @ApiProperty({ description: 'Id of some of existed brand' })
  @IsMongoId()
  productBrand: string;

  @ApiProperty({ description: 'Id of some of existed model' })
  @IsMongoId()
  productModel: string;

  @ApiProperty({
    description:
      'Should be selected within the range from 1900 till current year.',
  })
  @IsInt()
  @Min(PRODUCT_YEAR_OF_ISSUE_MIN_VALUE)
  @Max(PRODUCT_YEAR_OF_ISSUE_MAX_VALUE)
  yearOfIssue: number;

  @ApiProperty()
  @IsEnum(ProductColors)
  color: ProductColors;

  @ApiProperty({
    description: 'Should be selected within the range 100 - 500000 EUR',
  })
  @IsNumber()
  @Min(PRODUCT_PRICE_MIN_VALUE)
  @Max(PRODUCT_PRICE_MAX_VALUE)
  price: number;

  @ApiProperty({
    description: 'Should be selected within the range from 10 till 100.',
  })
  @IsInt()
  @Min(PRODUCT_WARRANTY_MIN_VALUE)
  @Max(PRODUCT_WARRANTY_MAX_VALUE)
  warranty: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  description?: string;
}
