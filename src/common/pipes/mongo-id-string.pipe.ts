import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoIdStringPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const validObjectId: boolean = mongoose.isValidObjectId(value);
    if (!validObjectId) {
      throw new BadRequestException('Invalid mongoDb id');
    }
    return value;
  }
}
