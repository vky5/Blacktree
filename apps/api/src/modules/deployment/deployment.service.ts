import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from './entities/deployment.entity';
import { CreateDeploymentDTO } from './dto/deployment.dto';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { MessagingQueueService } from '../messaging-queue/messaging-queue.service';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepo: Repository<Deployment>,
    private readonly messageingQueueService: MessagingQueueService,
  ) {}

  // for creating a new deployment

  createDeployment(
    deploymentData: CreateDeploymentDTO,
    userId: string,
  ): Promise<Deployment> {
    const newDeployment = this.deploymentRepo.create({
      name: deploymentData.name,
      repositoryUrl: deploymentData.repositoryUrl,
      dockerFilePath: deploymentData.dockerFilePath,
      deploymentStatus: DeploymentStatus.PENDING, // Default status
      branch: deploymentData.branch,
      user: { id: userId },
    });

    return this.deploymentRepo.save(newDeployment);
  }

  // for updating an existing deployment
  async updateDeployment(
    deploymentId: string,
    updateData: Partial<CreateDeploymentDTO>,
  ): Promise<Deployment> {
    const deployment = await this.deploymentRepo.findOneBy({
      id: deploymentId,
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const updateDeployment = this.deploymentRepo.merge(deployment, updateData);
    return this.deploymentRepo.save(updateDeployment);
  }

  // for deleting a deployment
  async deleteDeployment(deploymentId: string): Promise<void> {
    try {
      await this.deploymentRepo.delete(deploymentId);
    } catch (error) {
      console.error('Error deleting deployment:', error);
      throw new InternalServerErrorException('Failed to delete deployment');
    }
  }

  findByIdWithUser(deploymentId: string): Promise<Deployment | null> {
    return this.deploymentRepo.findOne({
      where: { id: deploymentId },
      relations: ['user'], // Include user relation
      select: {
        id: true,
      },
    });
  }

  // creating a mq
  async triggerDeployment(deploymentId: string) {
    const deployment = await this.deploymentRepo.findOne({
      where: { id: deploymentId },
      relations: ['user'], // Include user relation
      select: {
        id: true,
        repositoryUrl: true,
        branch: true,
        user: {
          id: true,
        },
      },
    });

    if (!deployment) {
      throw new BadRequestException('Deployment not found');
    }

    const message = {
      deploymentId: deployment.id,
      userId: deployment.user.id,
      repoUrl: deployment.repositoryUrl,
      branch: deployment.branch,
      createdAt: new Date().toISOString(),
    };

    this.messageingQueueService.publishMessage('blacktree.routingKey', message);
  }
}
