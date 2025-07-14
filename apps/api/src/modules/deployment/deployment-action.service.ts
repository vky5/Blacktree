import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deployment } from './entities/deployment.entity';
import { PublishDeploymentMessageDto } from '../messaging-queue/dto/publish-message.dto';
import { MessagingQueueService } from '../messaging-queue/messaging-queue.service';
import { Repository } from 'typeorm';

@Injectable()
export class DeploymentActionService {
  constructor(
    @InjectRepository(Deployment)
    private readonly deploymentRepo: Repository<Deployment>,
    private readonly messageingQueueService: MessagingQueueService,
  ) {}

  // for building the image and uploading the image to the ecr
  // sending a build job to orchestrator to send to the workers
  async buildDeployment(deploymentId: string) {
    const deployment = await this.deploymentRepo.findOne({
      where: { id: deploymentId },
      relations: ['user'], // Include user relation
      select: {
        id: true,
        repository: true,
        branch: true,
        dockerFilePath: true,
        contextDir: true,
        user: {
          id: true,
          token: true,
        },
      },
    });

    if (!deployment) {
      throw new BadRequestException('Deployment not found');
    }

    const message: PublishDeploymentMessageDto = {
      deploymentId: deployment.id,
      token: deployment.user.token,
      repository: deployment.repository,
      branch: deployment.branch,
      dockerFilePath: deployment.dockerFilePath,
      contextDir: deployment.contextDir,
      createdAt: new Date().toISOString(),
    };

    this.messageingQueueService.publishMessage('blacktree.routingKey', message);
  }
}
