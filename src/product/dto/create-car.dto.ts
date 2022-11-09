import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCarDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carBrand: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carModel: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brandCountry: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bodyType: string;

  @ApiProperty({
    description:
      'Should be selected within the range from 1900 till current year.',
  })
  @IsInt()
  @Max(new Date().getFullYear())
  yearOfIssue: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  engineType: string;

  @ApiProperty()
  @IsNumber()
  @Max(10)
  @Min(0)
  engineSize: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  drive: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transmissionType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color: string;

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
}
