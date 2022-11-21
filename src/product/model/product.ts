import { ApiProperty } from '@nestjs/swagger';
import { IProductModel } from './product-model';
import { IProductBrand } from './product-brand';
import { ProductColors } from './enums/product-colors.enum';

export class IProduct {
  @ApiProperty({
    type: IProductBrand,
  })
  productBrand: IProductBrand;

  @ApiProperty({
    type: IProductModel,
  })
  productModel: IProductModel;

  @ApiProperty()
  yearOfIssue: number;

  @ApiProperty()
  color: ProductColors;

  @ApiProperty()
  price: number;

  @ApiProperty()
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
