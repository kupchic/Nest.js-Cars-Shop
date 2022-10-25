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

  async registerUser(registerDto: RegisterDto): Promise<void> {
    const user: User = await this.findByEmail(registerDto.email);
    if (!!user) {
      throw new ConflictException(
        `The actor with the following email address is already registered.`,
      );
    }
    const hashedPass: string = await bcrypt.hash(registerDto.password, 10);

    await this.userModel.create({
      ...registerDto,
      password: hashedPass,
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

  async updateUserPass(resetPassDto: ResetPassDto): Promise<User> {
    const user: User = await this.findByEmail(resetPassDto.email);
    if (!user) {
      throw new NotFoundException('There is no user with this email.');
    } else if (await this.comparePasswords(resetPassDto.password, user)) {
      throw new ConflictException('New password should not match the current');
    }
    const password: string = await bcrypt.hash(resetPassDto.password, 10);
    return this.userModel.findByIdAndUpdate(user.id, { password });
  }

  async updateUserRefreshToken(userID: string, rt: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(userID, {
      refresh_token: rt ? await bcrypt.hash(rt, 10) : null,
    });
  }

  async comparePasswords(pass: string, user: User): Promise<boolean> {
    return bcrypt.compare(pass, user.password);
  }

  private _isValidId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }
}
