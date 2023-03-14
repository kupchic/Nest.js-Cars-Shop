import { Injectable } from '@nestjs/common';
import { GetOrdersStatisticsDto } from '../dto/get-orders-statistics.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CollectionsName, ModelName } from '../../common/model';
import { Order, OrderDocument, OrderModel } from '../schemas/order.schema';
import mongoose, { FilterQuery } from 'mongoose';
import {
  AXLE_PITCH_DATE_FORMAT,
  StatisticsAxlePitch,
} from '../model/enums/statistics-axle-pitch';
import { StatisticsEntity } from '../entities/statistics.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(ModelName.ORDER)
    private orderModel: OrderModel,
  ) {}
  getProductSalesStatistics(
    dto: GetOrdersStatisticsDto,
  ): Promise<Order[] | StatisticsEntity> {
    try {
      const filterMatch: FilterQuery<OrderDocument> = { $and: [] };

      const filterMatchAfterLookup: FilterQuery<OrderDocument> = { $and: [] };

      const curDate: Date = new Date();
      const yearAgo: Date = new Date(
        new Date().setFullYear(curDate.getFullYear() - 1),
      );
      const dateFrom: Date = new Date(dto.dateFrom || yearAgo);
      const dateTill: Date = new Date(dto.dateTill || curDate);
      const axelPitch: StatisticsAxlePitch =
        dto.axlePitch || StatisticsAxlePitch.MONTH;
      filterMatch.$and.push({
        createdAt: {
          $gte: dateFrom,
          $lte: dateTill,
        },
      });

      if (dto?.orderStatus || dto?.orderStatus === 0) {
        filterMatch.$and.push({
          status: {
            $eq: dto.orderStatus,
          },
        });
      }

      if (dto?.productBrand) {
        filterMatchAfterLookup.$and.push({
          productsBrands: {
            $elemMatch: {
              _id: new mongoose.Types.ObjectId(dto.productBrand),
            },
          },
        });
      }
      if (dto?.productModel) {
        filterMatchAfterLookup.$and.push({
          productsModels: {
            $elemMatch: {
              _id: new mongoose.Types.ObjectId(dto.productModel),
            },
          },
        });
      }
      if (!filterMatchAfterLookup.$and.length) {
        delete filterMatchAfterLookup.$and;
      }

      const modePipeline: mongoose.PipelineStage[] = dto.countMode
        ? [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: AXLE_PITCH_DATE_FORMAT[axelPitch],
                    date: '$createdAt',
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $addFields: {
                date: {
                  $toString: '$_id',
                },
              },
            },
            {
              $unset: '_id',
            },
            { $sort: { date: 1 } },
          ]
        : [
            { $project: { productsModels: 0, productsBrands: 0, products: 0 } },
            {
              $addFields: {
                id: {
                  $toString: '$_id',
                },
              },
            },
            {
              $addFields: {
                user: {
                  $toString: '$user',
                },
              },
            },
            {
              $unset: '_id',
            },
            { $sort: { createdAt: 1 } },
          ];

      return this.orderModel
        .aggregate([
          {
            $match: filterMatch,
          },
          {
            $lookup: {
              from: CollectionsName.PRODUCTS_BRANDS,
              localField: 'products.product.productBrand',
              foreignField: 'id',
              as: 'productsBrands',
              pipeline: [{ $project: { _id: 1 } }],
            },
          },
          {
            $lookup: {
              from: CollectionsName.PRODUCTS_MODELS,
              localField: 'productModel',
              foreignField: 'id',
              as: 'productsModels',
              pipeline: [
                {
                  $project: { _id: 1 },
                },
              ],
            },
          },
          {
            $match: filterMatchAfterLookup,
          },
          ...modePipeline,
        ])
        .then((v: Order[] | { date: string; count: number }[]) => {
          if (!dto.countMode) {
            return v as Order[];
          }
          const statistics: StatisticsEntity = this._getAxelPitchIntervals(
            dateFrom,
            dateTill,
            axelPitch,
          );
          (v as { date: string; count: number }[]).forEach(
            (v: { date: string; count: number }) => {
              statistics[v.date] = v.count;
            },
          );
          return statistics;
        });
    } catch (e) {
      throw e;
    }
  }

  private _getAxelPitchIntervals(
    dateFrom: Date,
    dateTill: Date,
    period: StatisticsAxlePitch,
  ): StatisticsEntity {
    const statistics: StatisticsEntity = {};
    const currentDate: Date = new Date(dateFrom);
    while (currentDate <= dateTill) {
      statistics[this._getIsoDatePeriod(currentDate, period)] = 0;

      switch (period) {
        case StatisticsAxlePitch.DAY:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case StatisticsAxlePitch.MONTH:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case StatisticsAxlePitch.YEAR:
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          break;
      }
    }
    return statistics;
  }

  private _getIsoDatePeriod(date: Date, period: StatisticsAxlePitch): string {
    let dateEnd: number;
    switch (period) {
      case StatisticsAxlePitch.DAY:
        dateEnd = 10;
        break;
      case StatisticsAxlePitch.MONTH:
        dateEnd = 7;
        break;
      case StatisticsAxlePitch.YEAR:
        dateEnd = 4;
        break;
      default:
        dateEnd = 10;
    }
    return date.toISOString().substring(0, dateEnd);
  }
}
