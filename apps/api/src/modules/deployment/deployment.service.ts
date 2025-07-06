import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from './entities/deployment.entity';
import { CreateDeploymentDTO } from './dto/deployment.dto';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { MessagingQueueService } from '../messaging-queue/messaging-queue.service';
import { PublishDeploymentMessageDto } from '../messaging-queue/dto/publish-message.dto';
import { TriggerDeployment } from '../messaging-queue/dto/trigger-message.dto';
import { DeleteDeployment } from '../messaging-queue/dto/delete-message.dto';
import { StopMessage } from '../messaging-queue/dto/stop-message.dto';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepo: Repository<Deployment>,
    private readonly messageingQueueService: MessagingQueueService,
  ) {}

  // for creating a new deployment
  async createDeployment(
    deploymentData: CreateDeploymentDTO,
    userId: string,
  ): Promise<Deployment> {
    const res = await this.deploymentRepo.findOne({
      where: {
        branch: deploymentData.branch,
        repository: deploymentData.repository,
      },
    });

    if (res) {
      throw new BadRequestException(
        'Deployment of similar data already exists',
      );
    }

    const newDeployment = this.deploymentRepo.create({
      name: deploymentData.name,
      repository: deploymentData.repository,
      dockerFilePath: deploymentData.dockerFilePath,
      deploymentStatus: DeploymentStatus.PENDING, // Default status
      branch: deploymentData.branch,
      contextDir: deploymentData.contextDir,
      composeFilePath: deploymentData.composeFilePath || undefined,
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
        composeFilePath: true,
        portNumber: true,
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
      type: 'build',
      deploymentId: deployment.id,
      token: deployment.user.token,
      repository: deployment.repository,
      branch: deployment.branch,
      dockerFilePath: deployment.dockerFilePath,
      composeFilePath: deployment.composeFilePath || '',
      contextDir: deployment.contextDir,
      portNumber: deployment.portNumber || '',
      createdAt: new Date().toISOString(),
    };

    // console.log(message);

    this.messageingQueueService.publishMessage('blacktree.routingKey', message);
  }

  // getting a deployment info
  async deploymentInfo(id: string) {
    const deployment = await this.deploymentRepo.findOneBy({ id });

    if (!deployment) {
      throw new NotFoundException('No deployment of this id found');
    }

    return deployment;
  }

  // trigger the deployment launch
  triggerDeployment(deploymentId: string) {
    const message: TriggerDeployment = {
      type: 'trigger',
      deploymentId: deploymentId,
    };

    this.messageingQueueService.publishMessage('blacktree.routingKey', message);
  }

  // delete the deployment from worker
  deleteWorkerDeployment(deployentId: string) {
    const message: DeleteDeployment = {
      type: 'delete',
      deploymentId: deployentId,
    };

    this.messageingQueueService.publishMessage('blacktree.routingKey', message);
  }

  // to stop the deployment worker

  stopWorkerDeployment(deployentId: string) {
    const message: StopMessage = {
      type: 'stop',
      deploymentId: deployentId,
    };

    this.messageingQueueService.publishMessage('blacktree.routingKey', message);
  }
}
