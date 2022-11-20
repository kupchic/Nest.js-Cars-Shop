import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, USERS_COLLECTION_NAME } from './schemas';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USERS_COLLECTION_NAME) private userModel: Model<UserDocument>,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<User> {
    try {
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
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return this.userModel.find({});
    } catch (e) {
      throw e;
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return this.userModel.findOne({ email });
    } catch (e) {
      throw e;
    }
  }

  async findById(id: string): Promise<User> {
    try {
      return this.userModel.findById(id);
    } catch (e) {
      throw e;
    }
  }

  async deleteById(id: string): Promise<User> {
    try {
      return this.userModel.findByIdAndDelete(id);
    } catch (e) {
      throw e;
    }
  }

  async partialUserUpdate(
    userId: string,
    state: Partial<Omit<User, 'email' | 'id'>>,
  ): Promise<User> {
    try {
      if (state) {
        return this.userModel.findByIdAndUpdate(userId, state);
      } else throw new ConflictException('Provide data to update');
    } catch (e) {
      throw e;
    }
  }

  async comparePasswords(pass: string, user: User): Promise<boolean> {
    return bcrypt.compare(pass, user.password);
  }

  private _hash(str: string): Promise<string> {
    return str ? bcrypt.hash(str, 10) : null;
  }
}
