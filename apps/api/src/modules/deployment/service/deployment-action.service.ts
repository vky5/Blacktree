import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deployment } from '../entities/deployment.entity';
import { PublishDeploymentMessageDto } from 'src/modules/messaging-queue/dto/publish-message.dto';
import { MessagingQueueService } from 'src/modules/messaging-queue/messaging-queue.service';
import { Repository } from 'typeorm';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { AwsService } from 'src/modules/aws/aws.service';
import { DeploymentVersion } from '../entities/deployment-version.entity';

@Injectable()
export class DeploymentActionService {
  constructor(
    @InjectRepository(Deployment)
    private readonly deploymentRepo: Repository<Deployment>,

    @InjectRepository(DeploymentVersion)
    private readonly deploymentVersionRepo: Repository<DeploymentVersion>,

    private readonly messageingQueueService: MessagingQueueService,
    private readonly awsService: AwsService,
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

  async triggerDeployment(deploymentId: string) {
    try {
      // 1. Fetch deployment along with the latest version
      const deployment = await this.deploymentRepo.findOne({
        where: { id: deploymentId },
        relations: ['versions'],
      });

      if (!deployment) {
        throw new NotFoundException('Deployment not found');
      }

      const version = deployment.version;
      if (!version || !version.imageUrl) {
        throw new NotFoundException('No image version available to deploy');
      }

      // 2. Register Task Definition on ECS with given config
      const taskDefArn = await this.awsService.registerTaskDefinition(
        version.imageUrl,
        deployment.envVars || {},
        parseInt(deployment.portNumber || '3000'), // fallback port
        deployment.resourceVersion,
      );

      // 3. Save the registered Task Definition ARN in DB
      version.taskDefinitionArn = taskDefArn;
      await this.deploymentVersionRepo.save(version);

      // 4. Run the container based on the task definition
      const taskArn = await this.awsService.runContainer(taskDefArn);

      // 5. Save taskArn (running instance) for future termination/tracking
      version.taskArn = taskArn;
      version.deploymentStatus = DeploymentStatus.RUNNING;

      await this.deploymentVersionRepo.save(version);

      return {
        message: 'Container launched successfully',
        taskArn,
      };
    } catch (err) {
      console.error('Error in triggerDeployment:', err);
      throw err;
    }
  }

  // stopping the deployment
  async stopDeployment(deploymentId: string) {
    const res = await this.deploymentRepo.findOne({
      where: { id: deploymentId },
    });

    if (!res || !res.version) {
      throw new NotFoundException('No deployment found');
    }

    if (!res.version.taskArn) {
      throw new Error('Task ARN is missing. Cannot stop container.');
    }

    await this.awsService.stopContainer(res?.version?.taskArn);

    res.version.deploymentStatus = DeploymentStatus.STOPPED; // updating the status of the deployment
    await this.deploymentVersionRepo.save(res.version);
  }

  // soft deleting the contianer
  // stop the container, deregister the task definition, delete the image from ECR
  async cleanResources(deploymentId: string) {
    const deployment = await this.deploymentRepo.findOne({
      where: { id: deploymentId }, // eager is true so no need to define relation
    });

    if (!deployment || !deployment.version) {
      throw new NotFoundException('Deployment or version not found');
    }

    const { taskArn, taskDefinitionArn, imageUrl } = deployment.version;
    try {
      // stop the ecs task
      if (taskArn) {
        await this.awsService.stopContainer(taskArn); // halt the program until the task is actually deleted
      }

      // deregister the task definition
      if (taskDefinitionArn) {
        await this.awsService.deregisterTaskDefinition(taskDefinitionArn);
      }

      // deleting the image from the ECR
      if (imageUrl) {
        await this.awsService.deleteEcrImage(imageUrl);
      }

      // update the DB
      deployment.version.deploymentStatus = DeploymentStatus.STOPPED;
      deployment.version.taskArn = null;
      deployment.version.taskDefinitionArn = null;
      deployment.version.imageUrl = null;
      deployment.version.buildLogsUrl = null;
      deployment.version.runTimeLogsUrl = null;

      await this.deploymentVersionRepo.save(deployment.version);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to clean resources.');
    }
  }
}
