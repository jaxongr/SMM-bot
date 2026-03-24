import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupportService } from './support.service';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: string;
  };
}

@WebSocketGateway({
  namespace: '/support',
  cors: { origin: '*' },
})
export class SupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SupportGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly supportService: SupportService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      client.data = {
        userId: payload.sub,
        role: payload.role,
      };

      this.logger.log(`Client connected: userId=${payload.sub}, role=${payload.role}`);
    } catch {
      this.logger.warn('WebSocket auth failed, disconnecting client');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.data?.userId) {
      this.logger.log(`Client disconnected: userId=${client.data.userId}`);
    }
  }

  @SubscribeMessage('join-ticket')
  handleJoinTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string },
  ) {
    const room = `ticket:${data.ticketId}`;
    client.join(room);
    this.logger.log(`User ${client.data.userId} joined room ${room}`);
    return { event: 'joined-ticket', data: { ticketId: data.ticketId } };
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string; message: string; fileUrl?: string },
  ) {
    const isAdmin = client.data.role === 'ADMIN' || client.data.role === 'SUPER_ADMIN';

    const result = await this.supportService.sendMessage(
      data.ticketId,
      client.data.userId,
      { message: data.message, fileUrl: data.fileUrl },
      isAdmin,
    );

    const room = `ticket:${data.ticketId}`;
    this.server.to(room).emit('new-message', result.data);

    return { event: 'message-sent', data: result.data };
  }
}
