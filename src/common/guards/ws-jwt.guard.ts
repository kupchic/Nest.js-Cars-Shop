import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import 'dotenv/config';
import { User } from '../../user/schemas';
import { Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    try {
      const access_token: string =
        client.handshake.auth.auth_token || client.handshake.headers.auth_token;
      const user: User = await this.authService.verifyUserWithJwtPayload(
        access_token,
      );
      if (!user || !user.refresh_token) {
        throw new WsException('Unauthorized');
      }
      if (user.isBlocked) {
        throw new WsException('User is blocked');
      }
      context.switchToWs().getClient().user = user;
      return !!user;
    } catch (e) {
      client.disconnect(true);
      return false;
    }
  }
}
