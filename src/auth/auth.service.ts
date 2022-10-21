import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const user: User = await this.userService.findByEmail(loginDto.email);
    const isPasswordMatch: boolean = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user: User = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      token: await this.generateToken(user),
    };
  }

  async generateToken(user: User): Promise<string> {
    const payload: any = {
      email: user.email,
      id: (user as any).id,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
