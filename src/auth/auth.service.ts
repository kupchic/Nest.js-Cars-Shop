import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../user/user.schema';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserJwtPayload } from '../user/entities/user-jwt-payload';
import { MailService } from '../mail/mail.service';
import { ResetPassDto } from './dto/reset-pass.dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/tokens';
import { ChangePassDto } from './dto/change-pass.dto';
import 'dotenv/config';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
    try {
      const tokens: Tokens = await this._generateTokens(user);
      await this.userService.partialUserUpdate(user.id, {
        refresh_token: tokens.refresh_token,
      });
      return tokens;
    } catch (e) {
      throw e;
    }
  }

  async logout(userId): Promise<void> {
    try {
      await this.userService.partialUserUpdate(userId, {
        refresh_token: null,
      });
    } catch (e) {
      throw e;
    }
  }

  async changePassword(
    changePassDto: ChangePassDto,
    user: User,
  ): Promise<Tokens> {
    try {
      const [oldMatched, newMatched]: boolean[] = await Promise.all([
        bcrypt.compare(changePassDto.oldPassword, user.password),
        bcrypt.compare(changePassDto.newPassword, user.password),
      ]);
      if (!oldMatched) {
        throw new ForbiddenException('Wrong old password');
      }
      if (newMatched) {
        throw new ConflictException(
          'New password should not match the current',
        );
      }
      const tokens: Tokens = await this._generateTokens(user);
      await this.userService.partialUserUpdate(user.id, {
        password: await bcrypt.hash(changePassDto.newPassword, 10),
        refresh_token: tokens.refresh_token,
      });
      return tokens;
    } catch (e) {
      throw e;
    }
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    try {
      const user: User = await this.userService.findById(userId);
      if (!user || !user.refresh_token || rt !== user.refresh_token) {
        throw new ForbiddenException('Access Denied');
      }
      const tokens: Tokens = await this._generateTokens(user);
      await this.userService.partialUserUpdate(userId, {
        refresh_token: tokens.refresh_token,
      });
      return tokens;
    } catch (e) {
      throw e;
    }
  }

  async resetPassSendLink(email: string): Promise<void> {
    try {
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
    } catch (e) {
      throw e;
    }
  }

  async resetUserPassword(
    resetPassDto: ResetPassDto,
    userId,
    token: string,
  ): Promise<void> {
    try {
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
        throw new ConflictException(
          'The password reset link is no longer valid',
        );
      }
      if (
        await this.userService.comparePasswords(resetPassDto.password, user)
      ) {
        throw new ConflictException(
          'New password should not match the current',
        );
      }
      await this.userService.partialUserUpdate(user.id, {
        password: await bcrypt.hash(resetPassDto.password, 10),
      });
    } catch (e) {
      throw e;
    }
  }

  async registerUser(registerDto: RegisterDto): Promise<void> {
    await this.userService.registerUser(registerDto);
  }

  private async _generateTokens(user: User): Promise<Tokens> {
    try {
      const payload: UserJwtPayload = {
        email: user.email,
        id: user.id,
        roles: user.roles,
      };
      return {
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRE,
        }),
        refresh_token: this.jwtService.sign(payload, {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        }),
      };
    } catch (e) {
      throw e;
    }
  }

  private _generateResetPassSecret(user: User): string {
    return process.env.JWT_SECRET + user.id + user.password;
  }
}
