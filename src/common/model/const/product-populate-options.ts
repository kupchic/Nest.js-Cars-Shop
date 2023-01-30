import mongoose from 'mongoose';
import { ModelName } from '../enums/model-names.enum';

export const PRODUCT_POPULATE_OPTIONS: (string | mongoose.PopulateOptions)[] = [
  {
    path: 'productBrand',
    model: ModelName.PRODUCT_BRAND,
  },
  {
    path: 'productModel',
    model: ModelName.PRODUCT_MODEL,
  },
];
