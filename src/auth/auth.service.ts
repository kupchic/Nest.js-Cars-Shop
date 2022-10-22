import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserJwtPayload } from '../user/entities/user-jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const user: User = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new ConflictException('Incorrect email. Please, try again');
    }
    const isPasswordMatch: boolean = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (isPasswordMatch) {
      return user;
    } else throw new ConflictException('Wrong password. Please, try again');
  }

  async login(user: User): Promise<any> {
    return {
      token: await this.generateToken(user),
    };
  }

  async generateToken(user: User): Promise<string> {
    const payload: UserJwtPayload = {
      email: user.email,
      id: (user as any).id,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
