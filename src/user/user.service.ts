import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { ResetPassDto } from '../auth/dto/reset-pass.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async registerUser(registerDto: RegisterDto): Promise<User> {
    const user: User = await this.findByEmail(registerDto.email);
    if (!!user) {
      throw new ConflictException(
        `The actor with the following email address is already registered.`,
      );
    }
    return this.userModel.create({
      ...registerDto,
      password: await this._hash(registerDto.password),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find({});
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<User> {
    if (this._isValidId(id)) {
      return this.userModel.findById(id);
    }
    throw new NotFoundException('id is not valid');
  }

  async deleteById(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }

  async resetUserPass(resetPassDto: ResetPassDto): Promise<User> {
    const user: User = await this.findByEmail(resetPassDto.email);
    if (!user) {
      throw new NotFoundException('There is no user with this email.');
    } else if (await this.comparePasswords(resetPassDto.password, user)) {
      throw new ConflictException('New password should not match the current');
    }
    return this.partialUserUpdate(user.id, {
      password: await this._hash(resetPassDto.password),
    });
  }

  async updateUserRefreshToken(userID: string, rt: string): Promise<User> {
    return this.partialUserUpdate(userID, {
      refresh_token: await this._hash(rt),
    });
  }

  async comparePasswords(pass: string, user: User): Promise<boolean> {
    return bcrypt.compare(pass, user.password);
  }

  async partialUserUpdate(
    userId: string,
    state: Partial<Omit<User, 'email' | 'id'>>,
  ): Promise<User> {
    return this.userModel.findByIdAndUpdate(userId, state);
  }

  private _isValidId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  private _hash(str: string): Promise<string> {
    return str ? bcrypt.hash(str, 10) : null;
  }
}
