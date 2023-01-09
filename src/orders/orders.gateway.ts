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
import { Namespace, Socket } from 'socket.io';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../user/schemas';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({ namespace: 'orders', transports: ['websocket'] })
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Namespace;

  constructor(private readonly authService: AuthService) {}

  afterInit(server: Namespace): void {
    this.server.use(async (socket: Socket, next: any) => {
      const authToken: string = (
        socket.handshake.auth.auth_token || socket.handshake.headers?.auth_token
      )?.replace('Bearer ', '');
      try {
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
    const sockets: Map<string, Socket> = this.server.sockets;
    console.log(`WS client with id ${client.id} connected,`);
    console.log(`Number of connected sockets:${sockets.size} `);
  }
  handleDisconnect(client: Socket): void {
    const sockets: Map<string, Socket> = this.server.sockets;
    console.log(`WS client with id ${client.id} disconnected,`);
    console.log(`Number of connected sockets:${sockets.size} `);
  }

  emitOrderApproveDecline(order: Order): void {
    this.server.emit('order-status-updated', order);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('order-status-updated')
  handleOrderStatusUpdate(socket: Socket, data: Order): void {
    console.log(data);
  }
}
