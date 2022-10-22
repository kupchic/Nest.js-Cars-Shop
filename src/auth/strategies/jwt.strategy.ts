import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/user.schema';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private _userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(user: User): Promise<any> {
    return this._userService.findById(user.id);
  }
}
