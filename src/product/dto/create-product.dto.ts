import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DriveTypes } from '../model/enums/drive-types.enum';
import { TransmissionTypes } from '../model/enums/transmission-types.enum';
import { EngineTypes } from '../model/enums/engine-types.enum';
import { BodyTypes } from '../model/enums/body-types.enum';
import { ProductColors } from '../model/enums/product-colors.enum';

export class CreateProductDto {
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

  @ApiProperty({ enum: BodyTypes })
  @IsEnum(BodyTypes)
  bodyType: BodyTypes;

  @ApiProperty({
    description:
      'Should be selected within the range from 1900 till current year.',
  })
  @IsInt()
  @Max(new Date().getFullYear())
  yearOfIssue: number;

  @ApiProperty({ enum: EngineTypes })
  @IsEnum(EngineTypes)
  @IsNotEmpty()
  engineType: EngineTypes;

  @ApiProperty()
  @IsNumber()
  @Max(8)
  @Min(1)
  engineSize: number;

  @ApiProperty({ enum: DriveTypes })
  @IsEnum(DriveTypes)
  drive: DriveTypes;

  @ApiProperty({ enum: TransmissionTypes })
  @IsEnum(TransmissionTypes)
  @IsNotEmpty()
  transmissionType: TransmissionTypes;

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
}
