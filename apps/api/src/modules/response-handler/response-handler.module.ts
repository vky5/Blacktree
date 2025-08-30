import { Module } from '@nestjs/common';
import { MessagingQueueService } from '../messaging-queue/messaging-queue.service';

@Module({
  imports: [MessagingQueueService],
})
export class ResponseHandlerModule {}
