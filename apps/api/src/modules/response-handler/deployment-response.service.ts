import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagingQueueService } from '../messaging-queue/messaging-queue.service';

@Injectable()
export class DeploymentActionService implements OnModuleInit {
  constructor(private readonly messageingQueueService: MessagingQueueService) {}
  async onModuleInit() {
    await this.messageingQueueService.consumeMessages(
      'status.queue',
      'api.result',
      async (msg) => {
        await this.
      },
    );
  }
}
