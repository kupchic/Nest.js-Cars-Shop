import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from './schemas';
import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Car.name) private carsModel: Model<CarDocument>) {}

  async getAll(): Promise<Car[]> {
    try {
      return await this.carsModel.find().exec();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async create(createDto: CreateCarDto): Promise<Car> {
    try {
      return await this.carsModel.create(createDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
