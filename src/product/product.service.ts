import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from './schemas';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Car.name) private carsModel: Model<CarDocument>) {
    console.log('her');
    this.createCar({});
  }

  async createCar(v: any): Promise<void> {
    await this.carsModel.create(v);
  }
}
