import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { OrderStatus } from '../model/enums/order-status';
import { StatisticsAxlePitch } from '../model/enums/statistics-axle-pitch';
import { StatisticsChartType } from '../model/enums/statistics-chart-type';

export class GetOrdersStatisticsDto {
  @ApiProperty({ description: 'Id of some of existed brand' })
  @IsMongoId()
  @IsOptional()
  productBrand?: string;

  @ApiProperty({ description: 'Id of some of existed model' })
  @IsMongoId()
  @IsOptional()
  productModel?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  dateFrom?: number;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  dateTill?: number;

  @ApiProperty()
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @ApiProperty()
  @IsEnum(StatisticsAxlePitch)
  @IsOptional()
  axlePitch?: StatisticsAxlePitch;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  countMode?: boolean;

  @ApiProperty()
  @IsEnum(StatisticsChartType)
  @IsOptional()
  chartType?: StatisticsChartType;
}
