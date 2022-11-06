import { Strategy } from 'passport-local';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../../user/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user: User = await this.authService.validateUser({
        email,
        password,
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      if (user.isBlocked) {
        throw new ForbiddenException('User is blocked');
      }
      return user;
    } catch (e) {
      return e;
    }
  }
}
