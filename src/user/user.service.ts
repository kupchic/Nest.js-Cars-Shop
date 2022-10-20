import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UserRoles } from './entities/user-roles.enum';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async registerUser(registerDto: RegisterDto): Promise<User> {
    const user: User = await this.findByEmail(registerDto.email);
    if (!!user) {
      throw new ConflictException(
        `User with email:${registerDto.email} is existed`,
      );
    }
    const hashedPass: string = await bcrypt.hash(registerDto.password, 10);

    return this.userModel.create({
      ...registerDto,
      password: hashedPass,
      roles: [UserRoles.CUSTOMER],
    } as User);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find({}, { id: 's' });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async deleteById(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }
}
