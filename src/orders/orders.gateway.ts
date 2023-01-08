import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Order } from './schemas/order.schema';
import { Namespace, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';

@WebSocketGateway({ namespace: 'orders' })
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Namespace;

  afterInit(server: any): void {
    console.log(`server initialized`);
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
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('order-status-updated')
  handleOrderStatusUpdate(socket: Socket, data: Order): void {
    console.log(data);
  }
}
