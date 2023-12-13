import { ApiProperty } from '@nestjs/swagger';
import {
  BodyTypes,
  DriveTypes,
  EngineTypes,
  TransmissionTypes,
} from '../model';

export class IProductModel {
  @ApiProperty()
  modelName: string;

  @ApiProperty({ enum: BodyTypes, type: BodyTypes })
  bodyType: BodyTypes;

  @ApiProperty({ enum: EngineTypes })
  engineType: EngineTypes;

  @ApiProperty()
  engineSize: number;

  @ApiProperty({ enum: DriveTypes })
  drive: DriveTypes;

  @ApiProperty({ enum: TransmissionTypes })
  transmissionType: TransmissionTypes;

  @ApiProperty()
  id: string;
}
