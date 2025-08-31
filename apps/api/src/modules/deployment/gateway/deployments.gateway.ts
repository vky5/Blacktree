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
  cors: { origin: '*' }, // adjust to your frontend
})
export class DeploymentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToLogs')
  handleSubscribeToLogs(
    @MessageBody() payload: SubscribeLogsDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { deploymentId } = payload;
    console.log(`Client ${client.id} subscribed to deployment ${deploymentId}`);
    void client.join(deploymentId); // add client to room
    return { message: `Subscribed to deployment ${deploymentId}` };
  }

  sendLogLine(deploymentId: string, logLine: string) {
    console.log('logLine : ', logLine);
    this.server.to(deploymentId).emit('newLogLine', logLine);
  }
}
