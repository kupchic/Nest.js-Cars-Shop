import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { RegisterDto } from './register/dto/register.dto';
import { UserRoles } from './entities/user-roles.enum';
import * as bcrypt from 'bcrypt';

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
      userRole: UserRoles.CUSTOMER,
    });
  }
  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }
}
