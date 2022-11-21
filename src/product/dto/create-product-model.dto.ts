import { ApiProperty } from '@nestjs/swagger';
import {
  BodyTypes,
  DriveTypes,
  EngineTypes,
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
}
