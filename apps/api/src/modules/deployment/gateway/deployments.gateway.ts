import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SubscribeLogsDto } from '../dto/subscribe-logs.dto';

@WebSocketGateway({
  namespace: '/deployments', // ws://server/deployments
  cors: { origin: '*' },
})
export class DeploymentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[Gateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Gateway] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToLogs')
  handleSubscribeToLogs(
    @MessageBody() payload: SubscribeLogsDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { deploymentId } = payload;
    console.log(
      `[Gateway] Client ${client.id} subscribed to deployment ${deploymentId}`,
    );

    // put client into that deployment's room
    void client.join(deploymentId);

    return { message: `Subscribed to deployment ${deploymentId}` };
  }

  // call this from your service when new log lines are available
  sendLogLine(deploymentId: string, logLine: string) {
    console.log(`[Gateway] Emitting log to room ${deploymentId}: ${logLine}`);

    this.server.to(deploymentId).emit('newLogLine', {
      deploymentId,
      logLine,
    });
  }
}
