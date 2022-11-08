import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { Request } from 'express';
import { UserJwtPayload } from '../../user/entities/user-jwt-payload';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: UserJwtPayload): Promise<any> {
    const refreshToken: string = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      ?.trim();
    return refreshToken
      ? {
          ...payload,
          refresh_token: refreshToken,
        }
      : false;
  }
}
