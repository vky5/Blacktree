import { Test, TestingModule } from '@nestjs/testing';
import { AwsController } from './aws.controller';

describe('AwsController', () => {
  let controller: AwsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsController],
    }).compile();

    controller = module.get<AwsController>(AwsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
