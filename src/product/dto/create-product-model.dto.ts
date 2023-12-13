import { ApiProperty } from '@nestjs/swagger';
import {
  BodyTypes,
  DriveTypes,
  EngineTypes,
  PRODUCT_ENGINE_SIZE_MAX_VALUE,
  PRODUCT_ENGINE_SIZE_MIN_VALUE,
  TransmissionTypes,
} from '../model';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProductModelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  modelName: string;

  @ApiProperty({ enum: BodyTypes })
  @IsEnum(BodyTypes)
  bodyType: BodyTypes;

  @ApiProperty({ enum: EngineTypes })
  @IsEnum(EngineTypes)
  @IsNotEmpty()
  engineType: EngineTypes;

  @ApiProperty()
  @IsNumber()
  @Max(PRODUCT_ENGINE_SIZE_MAX_VALUE)
  @Min(PRODUCT_ENGINE_SIZE_MIN_VALUE)
  engineSize: number;

  @ApiProperty({ enum: DriveTypes })
  @IsEnum(DriveTypes)
  drive: DriveTypes;

  @ApiProperty({ enum: TransmissionTypes })
  @IsEnum(TransmissionTypes)
  @IsNotEmpty()
  transmissionType: TransmissionTypes;
}
