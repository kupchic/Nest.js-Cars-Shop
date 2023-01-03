import {
  BadRequestException,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoIdStringPipe
  implements PipeTransform<string | string[], string | string[]>
{
  private readonly _isArray: boolean;

  constructor(@Optional() isArray: boolean = false) {
    this._isArray = isArray;
  }

  transform(value: string | string[]): string | string[] {
    if (this._isArray) {
      if (
        Array.isArray(value) &&
        value.every((id: string) => mongoose.isValidObjectId(id))
      ) {
        return value;
      } else throw new BadRequestException('Array include invalid mongoDb id');
    }
    const validObjectId: boolean = mongoose.isValidObjectId(value);
    if (!validObjectId) {
      throw new BadRequestException('Invalid mongoDb id');
    }
    return value;
  }
}
