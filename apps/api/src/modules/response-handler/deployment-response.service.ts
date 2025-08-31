import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagingQueueService } from '../messaging-queue/messaging-queue.service';
import { DeploymentActionService } from '../deployment/service/deployment-action.service';
import { MQResponseDTO } from './mq-response.dto';

@Injectable()
export class DeploymentResponseService implements OnModuleInit {
  constructor(
    private readonly messageingQueueService: MessagingQueueService,
    private readonly deploymentActionService: DeploymentActionService,
  ) {}

  async onModuleInit() {
    await this.messageingQueueService.consumeMessages(
      'status.queue', // queueName
      (msg: MQResponseDTO): void => {
        // Call your handler from DeploymentActionService
        this.deploymentActionService.handleJobResult(msg).catch((err) => {
          console.error('Failed to handle job result:', err);
        });
      },
    );
  }
}
