import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Order } from './schemas/order.schema';
import { Server, Socket } from 'socket.io';
import { ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../user/schemas';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { ExtendedError } from 'socket.io/dist/namespace';

@WebSocketGateway({ namespace: 'orders', transports: ['websocket'] })
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly _logger = new Logger(OrdersGateway.name);
  @WebSocketServer()
  private _server: Server;

  constructor(private readonly authService: AuthService) {}

  afterInit(server: Server): void {
    server.use(async (socket: Socket, next: (err?: ExtendedError) => void) => {
      try {
        const authToken: string = (
          socket.handshake.auth.auth_token ||
          socket.handshake.headers.auth_token
        )?.replace('Bearer ', '');
        const user: User = await this.authService.verifyUserWithJwtPayload(
          authToken,
        );
        if (!user || !user.refresh_token) {
          throw new WsException('Unauthorized');
        }
        if (user.isBlocked) {
          throw new WsException('User is blocked');
        }
        next();
      } catch {
        next(new ForbiddenException());
      }
    });
  }

  handleConnection(client: Socket): void {
    const sockets: Map<string, Socket> = this._server.sockets as unknown as Map<
      string,
      Socket
    >;
    this._logger.log(`WS client with id ${client.id} connected,`);
    this._logger.log(`Number of connected sockets:${sockets.size} `);
  }
  handleDisconnect(client: Socket): void {
    const sockets: Map<string, Socket> = this._server.sockets as unknown as Map<
      string,
      Socket
    >;
    this._logger.log(`WS client with id ${client.id} disconnected,`);
    this._logger.log(`Number of connected sockets:${sockets.size} `);
  }

  emitOrderApproveDecline(order: Order): void {
    this._server.emit('order-status-updated', order);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('order-status-updated')
  handleOrderStatusUpdate(socket: Socket, data: Order): void {
    this._logger.log(data);
  }
}
