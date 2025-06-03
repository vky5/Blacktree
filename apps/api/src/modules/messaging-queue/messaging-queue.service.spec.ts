import { Test, TestingModule } from '@nestjs/testing';
import { MessagingQueueService } from './messaging-queue.service';

describe('MessagingQueueService', () => {
  let service: MessagingQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingQueueService],
    }).compile();

    service = module.get<MessagingQueueService>(MessagingQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
