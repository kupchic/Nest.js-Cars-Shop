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
import { ProductColors } from '../model/enums/product-colors.enum';

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
  @Max(new Date().getFullYear())
  yearOfIssue: number;

  @ApiProperty()
  @IsEnum(ProductColors)
  color: ProductColors;

  @ApiProperty({
    description: 'Should be selected within the range 100 - 500000 EUR',
  })
  @IsNumber()
  @Min(100)
  @Max(500000)
  price: number;

  @ApiProperty({
    description: 'Should be selected within the range from 10 till 100.',
  })
  @IsInt()
  @Min(10)
  @Max(100)
  warranty: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  description?: string;
}
