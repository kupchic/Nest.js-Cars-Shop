import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from '../user/user.schema';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserJwtPayload } from '../user/entities/user-jwt-payload';
import { MailService } from '../mail/mail.service';
import { ResetPassDto } from './dto/reset-pass.dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/tokens';
import { ConfigService } from '@nestjs/config';
import { ChangePassDto } from './dto/change-pass.dto';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const user: User = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new ConflictException('Incorrect email. Please, try again');
    }
    const isPasswordMatch: boolean = await this.userService.comparePasswords(
      loginDto.password,
      user,
    );
    if (isPasswordMatch) {
      return user;
    } else throw new ConflictException('Wrong password. Please, try again');
  }

  async login(user: User): Promise<Tokens> {
    const tokens: Tokens = await this.generateTokens(user);
    await this.userService.partialUserUpdate(user.id, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  async logout(userId): Promise<void> {
    await this.userService.partialUserUpdate(userId, {
      refresh_token: null,
    });
  }

  async changePassword(
    changePassDto: ChangePassDto,
    user: User,
  ): Promise<Tokens> {
    const [oldMatched, newMatched]: boolean[] = await Promise.all([
      bcrypt.compare(changePassDto.oldPassword, user.password),
      bcrypt.compare(changePassDto.newPassword, user.password),
    ]);
    if (!oldMatched) {
      throw new ForbiddenException('Wrong old password');
    }
    if (newMatched) {
      throw new ConflictException('New password should not compare to current');
    }
    const tokens: Tokens = await this.generateTokens(user);
    await this.userService.partialUserUpdate(user.id, {
      password: await bcrypt.hash(changePassDto.newPassword, 10),
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user: User = await this.userService.findById(userId);
    if (!user || !user.refresh_token || rt !== user.refresh_token) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens: Tokens = await this.generateTokens(user);
    await this.userService.partialUserUpdate(userId, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  async generateTokens(user: User): Promise<Tokens> {
    const payload: UserJwtPayload = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRE'),
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    };
  }

  async resetPassSendLink(email: string): Promise<void> {
    const user: User = await this.userService.findByEmail(email);
    if (!user) {
      throw new ConflictException('Incorrect email. Please, try again');
    }
    const token: string = this.jwtService.sign(
      {
        email: user.email,
        id: user.id,
      },
      {
        expiresIn: '15m',
        secret: this._generateResetPassSecret(user),
      },
    );
    const link: string = `http://localhost:5000/auth/reset-password/${user.id}/${token}`;
    return this.mailService.sendResetPassLink(user, link);
  }

  async resetUserPassword(
    resetPassDto: ResetPassDto,
    userId,
    token: string,
  ): Promise<void> {
    const user: User = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User is not found');
    }
    try {
      this.jwtService.verify(token, {
        secret: this._generateResetPassSecret(user),
        ignoreExpiration: false,
      });
    } catch (e) {
      throw new ConflictException('The password reset link is no longer valid');
    }
    if (await this.userService.comparePasswords(resetPassDto.password, user)) {
      throw new ConflictException('New password should not match the current');
    }
    await this.userService.partialUserUpdate(user.id, {
      password: await bcrypt.hash(resetPassDto.password, 10),
    });
  }

  private _generateResetPassSecret(user: User): string {
    return process.env.JWT_SECRET + user.id + user.password;
  }
}
