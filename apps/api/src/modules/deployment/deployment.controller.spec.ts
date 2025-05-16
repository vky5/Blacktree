import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentController } from './deployment.controller';

describe('DeploymentController', () => {
  let controller: DeploymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentController],
    }).compile();

    controller = module.get<DeploymentController>(DeploymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
