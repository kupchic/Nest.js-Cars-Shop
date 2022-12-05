import { ApiProperty } from '@nestjs/swagger';
import { IProductModel } from './product-model';
import { IProductBrand } from './product-brand';
import { ProductColors } from './enums/product-colors.enum';
import {
  PRODUCT_WARRANTY_MAX_VALUE,
  PRODUCT_WARRANTY_MIN_VALUE,
} from './consts/product-warranty-value';
import {
  PRODUCT_YEAR_OF_ISSUE_MAX_VALUE,
  PRODUCT_YEAR_OF_ISSUE_MIN_VALUE,
} from './consts/product-year-of-issue';

export class IProduct {
  @ApiProperty({
    type: IProductBrand,
  })
  productBrand: IProductBrand;

  @ApiProperty({
    type: IProductModel,
  })
  productModel: IProductModel;

  @ApiProperty({
    maximum: PRODUCT_YEAR_OF_ISSUE_MAX_VALUE,
    minimum: PRODUCT_YEAR_OF_ISSUE_MIN_VALUE,
  })
  yearOfIssue: number;

  @ApiProperty()
  color: ProductColors;

  @ApiProperty({
    maximum: PRODUCT_WARRANTY_MAX_VALUE,
    minimum: PRODUCT_WARRANTY_MIN_VALUE,
  })
  price: number;

  @ApiProperty({
    maximum: PRODUCT_WARRANTY_MAX_VALUE,
    minimum: PRODUCT_WARRANTY_MIN_VALUE,
  })
  warranty: number;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  id: string;
}
