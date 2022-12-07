import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/schemas';
import { UserService } from '../../user/user.service';
import { UserJwtPayload } from '../../user/model/user-jwt-payload';
import 'dotenv/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private _userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: UserJwtPayload): Promise<User> {
    try {
      const user: User = await this._userService.findById(payload.id);
      if (!user || !user.refresh_token) {
        throw new UnauthorizedException();
      }
      if (user.isBlocked) {
        throw new ForbiddenException('User is blocked');
      }
      return user;
    } catch (e) {
      throw e;
    }
  }
}
