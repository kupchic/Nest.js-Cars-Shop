import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetOrdersStatisticsDto } from '../dto/get-orders-statistics.dto';
import { Roles } from '../../common/decorators';
import { UserRoles } from '../../user/model/enum/user-roles.enum';
import { Order } from '../schemas/order.schema';
import * as XLSXChart from 'xlsx-chart';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { StatisticsEntity } from '../entities/statistics.entity';
import { KeyValuePairs } from '../../common/model';
import { StatisticsChartType } from '../model/enums/statistics-chart-type';

@ApiTags('Orders Statistics Module')
@Controller('orders/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiResponse({
    type: [Order],
  })
  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @Post()
  getStatistics(
    @Body() getDto: GetOrdersStatisticsDto,
  ): Promise<Order[] | StatisticsEntity> {
    return this.statisticsService.getProductSalesStatistics(getDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @Post('download')
  @HttpCode(200)
  async getStatisticsExcel(
    @Body() getDto: GetOrdersStatisticsDto,
    @Res() res: Response,
  ): Promise<void> {
    const data: Order[] | StatisticsEntity =
      await this.statisticsService.getProductSalesStatistics(getDto);

    const filename: string = `statistics-${new Date()
      .toISOString()
      .substring(0, 10)}.xlsx`;
    const filePath: string = path.join(__dirname, filename);
    const workSheet: WorkSheet = Array.isArray(data)
      ? XLSX.utils.json_to_sheet(data)
      : XLSX.utils.aoa_to_sheet([Object.keys(data), Object.values(data)]);
    const workBook: WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Statistics');
    XLSX.writeFile(workBook, filePath);

    res.download(filePath, filename, (err: Error) => {
      if (err) {
        throw err;
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Roles(UserRoles.ADMIN, UserRoles.MANAGER)
  @Post('download/chart')
  @HttpCode(200)
  async getStatisticsEChart(
    @Body() getDto: GetOrdersStatisticsDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const data: StatisticsEntity =
        (await this.statisticsService.getProductSalesStatistics({
          ...getDto,
          countMode: true,
        })) as StatisticsEntity;

      const filename: string = `statistics-${new Date()
        .toISOString()
        .substring(0, 10)}.xlsx`;
      const xlsxChart: XLSXChart = new XLSXChart();
      const opts: KeyValuePairs<any> = {
        chart: getDto.chartType || StatisticsChartType.LINE,
        titles: ['Count'],
        chartTitle: 'Sales',
        fields: Object.keys(data),
        data: {
          Count: data,
        },
      };

      xlsxChart.generate(opts, function (err, data) {
        if (err) {
          throw err;
        } else {
          res.set({
            'Content-Type': 'application/vnd.ms-excel',
            'Content-Disposition': `attachment; filename=${filename}`,
            'Content-Length': data.length,
          });
          res.status(200).send(data);
        }
      });
    } catch (e) {
      throw e;
    }
  }
}
