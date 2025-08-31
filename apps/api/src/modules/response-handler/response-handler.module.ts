import { Module } from '@nestjs/common';
import { MessagingQueueModule } from '../messaging-queue/messaging-queue.module';
import { DeploymentResponseService } from './deployment-response.service';
import { DeploymentModule } from '../deployment/deployment.module';

@Module({
  imports: [MessagingQueueModule, DeploymentModule],
  providers: [DeploymentResponseService],
})
export class ResponseHandlerModule {}
