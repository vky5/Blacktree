import { Module } from '@nestjs/common';
import { MessagingQueueService } from './messaging-queue.service';

@Module({
  providers: [MessagingQueueService],
  exports: [MessagingQueueService],
})
export class MessagingQueueModule {}
