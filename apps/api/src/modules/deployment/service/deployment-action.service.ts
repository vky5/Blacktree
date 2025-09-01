import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from '../entities/deployment.entity';
import { DeploymentVersion } from '../entities/deployment-version.entity';
import { PublishDeploymentMessageDto } from 'src/modules/messaging-queue/dto/publish-message.dto';
import { MQResponseDTO } from 'src/modules/response-handler/mq-response.dto';
import { DeploymentStatus } from 'src/utils/enums/deployment-status.enum';
import { MessagingQueueService } from 'src/modules/messaging-queue/messaging-queue.service';
import { AwsService } from 'src/modules/aws/aws.service';
import { DeploymentsGateway } from '../gateway/deployments.gateway';
import { DeploymentService } from './deployment.service';

@Injectable()
export class DeploymentActionService {
  constructor(
    @InjectRepository(Deployment)
    private readonly deploymentRepo: Repository<Deployment>,

    @InjectRepository(DeploymentVersion)
    private readonly deploymentVersionRepo: Repository<DeploymentVersion>,

    private readonly messagingQueueService: MessagingQueueService,
    private readonly deploymentService: DeploymentService,
    private readonly awsService: AwsService,
    private readonly deploymentGateway: DeploymentsGateway,
  ) {}

  // Builds image and uploads to ECR by publishing job to orchestrator
  async buildDeployment(
    deploymentId: string,
    userId?: string,
    existingVersionId?: string,
  ) {
    // Fetch the deployment with necessary details and the owner token
    const deployment = await this.deploymentRepo.findOne({
      where: { id: deploymentId },
      relations: ['user'],
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
    if (!existingVersionId) {
      if (!userId) {
        throw new BadRequestException(
          'User ID must be provided when no existing deployment version is supplied',
        );
      }

      // Create and save a new DeploymentVersion
      const newVersion = await this.createDeploymnetVersion(
        deploymentId,
        userId,
      );

      existingVersionId = newVersion.id;
    }
    // Prepare and send build message to orchestrator queue
    const message: PublishDeploymentMessageDto = {
      deploymentId: existingVersionId,
      token: deployment.user.token,
      repository: deployment.repository,
      branch: deployment.branch,
      dockerFilePath: deployment.dockerFilePath,
      contextDir: deployment.contextDir,
      createdAt: new Date().toISOString(),
    };
    this.messagingQueueService.publishMessage('worker.execute', message);

    // Send info to frontend
    this.examplePushLog(
      existingVersionId,
      'Build job published to orchestrator.',
    );
  }

  async triggerDeployment(deploymentVersionId: string) {
    this.examplePushLog(
      deploymentVersionId,
      `Triggering Deployment for : ${deploymentVersionId}`,
    );
    try {
      // 1. Fetch deployment along with the latest version
      const deploymentHosted = await this.deploymentVersionRepo.findOne({
        where: { id: deploymentVersionId },
        relations: ['deployment'],
      });

      if (!deploymentHosted) {
        const errMsg = 'No hosted deployment found';
        this.examplePushLog(deploymentVersionId, errMsg);
        throw new NotFoundException(errMsg);
      }

      // if taskarn is present
      if (deploymentHosted.taskArn) {
        try {
          await this.awsService.stopContainer(deploymentHosted.taskArn);
        } catch (error) {
          const errMsg = `Error stopping container: ${error}`;
          this.examplePushLog(deploymentVersionId, errMsg);
          throw new InternalServerErrorException(errMsg);
        }
      }

      // if taskdefinitionarn is already there, deregister it and then register it again
      if (deploymentHosted.taskDefinitionArn) {
        try {
          await this.awsService.deregisterTaskDefinition(
            deploymentHosted.taskDefinitionArn,
          );
        } catch (error) {
          const errMsg = `Error deregistering task definition: ${error}`;
          this.examplePushLog(deploymentVersionId, errMsg);
          throw new InternalServerErrorException(errMsg);
        }
      }

      // checking if the imageUrl exists or not
      if (!deploymentHosted.imageUrl) {
        const errMsg = 'Cannot launch deployment, no image URL present';
        this.examplePushLog(deploymentVersionId, errMsg);
        throw new NotFoundException(errMsg);
      }

      // 2. Register Task Definition on ECS with given config
      const taskDefArn = await this.awsService.registerTaskDefinition(
        deploymentHosted.imageUrl,
        deploymentHosted.deployment.envVars || {},
        parseInt(deploymentHosted.deployment.portNumber || '3000'), // fallback port
        deploymentHosted.deployment.resourceVersion,
      );
      this.examplePushLog(
        deploymentVersionId,
        `Task Definition registered: ${taskDefArn}`,
      );

      // 4. Run the container based on the task definition
      const taskArn = await this.awsService.runContainer(taskDefArn);
      this.examplePushLog(deploymentVersionId, `Container running: ${taskArn}`);

      // 5. Save taskArn (running instance) for future termination/tracking
      // 3. Save the registered Task Definition ARN in DB
      deploymentHosted.taskDefinitionArn = taskDefArn;
      deploymentHosted.taskArn = taskArn;
      deploymentHosted.deploymentStatus = DeploymentStatus.RUNNING;

      await this.deploymentVersionRepo.save(deploymentHosted);

      return {
        message: 'Container launched successfully',
        taskArn,
      };
    } catch (err) {
      this.examplePushLog(
        deploymentVersionId,
        `Error in triggerDeployment: ${err}`,
      );
      throw err;
    }
  }

  // stopping the deployment
  async stopDeployment(deploymentVersionId: string) {
    const res = await this.deploymentVersionRepo.findOne({
      where: { id: deploymentVersionId },
    });

    if (!res) {
      const errMsg = 'No deployment found';
      this.examplePushLog(deploymentVersionId, errMsg);
      throw new NotFoundException(errMsg);
    }

    if (!res.taskArn) {
      const errMsg = 'Task ARN is missing. Cannot stop container.';
      this.examplePushLog(deploymentVersionId, errMsg);
      throw new BadRequestException(errMsg);
    }

    await this.awsService.stopContainer(res?.taskArn);
    res.deploymentStatus = DeploymentStatus.STOPPED; // updating the status of the deployment
    await this.deploymentVersionRepo.save(res);

    this.examplePushLog(
      deploymentVersionId,
      'Deployment stopped successfully.',
    );
  }

  // soft deleting the container
  // stop the container, deregister the task definition, delete the image from ECR
  async cleanResources(deploymentVersionId: string) {
    const deployment = await this.deploymentVersionRepo.findOne({
      where: { id: deploymentVersionId }, // eager is true so no need to define relation
    });

    if (!deployment) {
      const errMsg = 'Deployment or version not found';
      this.examplePushLog(deploymentVersionId, errMsg);
      throw new NotFoundException(errMsg);
    }

    const { taskArn, taskDefinitionArn, imageUrl } = deployment;

    try {
      // stop the ecs task
      if (taskArn) {
        await this.awsService.stopContainer(taskArn); // halt the program until the task is actually deleted
        this.examplePushLog(
          deploymentVersionId,
          `Stopped container ${taskArn}`,
        );
      }

      // deregister the task definition
      if (taskDefinitionArn) {
        await this.awsService.deregisterTaskDefinition(taskDefinitionArn);
        this.examplePushLog(
          deploymentVersionId,
          `Deregistered task definition ${taskDefinitionArn}`,
        );
      }

      // deleting the image from the ECR
      if (imageUrl) {
        await this.awsService.deleteEcrImage(imageUrl);
        this.examplePushLog(deploymentVersionId, `Deleted image ${imageUrl}`);
      }

      // update the DB
      deployment.deploymentStatus = DeploymentStatus.STOPPED;
      deployment.taskArn = null;
      deployment.taskDefinitionArn = null;
      deployment.imageUrl = null;
      deployment.buildLogsUrl = null;
      deployment.runTimeLogsUrl = null;

      await this.deploymentVersionRepo.save(deployment);
      this.examplePushLog(
        deploymentVersionId,
        'Resources cleaned successfully.',
      );
      return deployment;
    } catch (err) {
      const errMsg = `Failed to clean resources: ${err}`;
      this.examplePushLog(deploymentVersionId, errMsg);
      throw new InternalServerErrorException(errMsg);
    }
  }

  // restarting the ECS from task arn
  async restartDeployment(deploymentVersionId: string) {
    try {
      const deployment = await this.deploymentVersionRepo.findOne({
        where: { id: deploymentVersionId },
      });
      if (!deployment || !deployment.taskDefinitionArn) {
        const errMsg = "Didn't find any deployment for this ID to restart";
        this.examplePushLog(deploymentVersionId, errMsg);
        throw new BadRequestException(errMsg);
      }

      await this.awsService.restartTask(deployment.taskDefinitionArn);
      this.examplePushLog(
        deploymentVersionId,
        'Deployment restarted successfully.',
      );

      return {
        status: 'success',
        message: 'Deployment restarted successfully',
      };
    } catch (error) {
      this.examplePushLog(
        deploymentVersionId,
        `Error restarting deployment: ${error}`,
      );
    }
  }

  // to redeploy the new build
  async redeploy(deploymentVersionId: string) {
    const deploymentVersion = await this.deploymentVersionRepo.findOne({
      where: { id: deploymentVersionId },
      relations: ['deployment'],
      select: {
        id: true,
        deployment: {
          id: true,
        },
      },
    });

    if (!deploymentVersion) {
      const errMsg = 'Deployment version not found';
      this.examplePushLog(deploymentVersionId, errMsg);
      throw new BadRequestException(errMsg);
    }

    await this.cleanResources(deploymentVersionId);
    return this.buildDeployment(
      deploymentVersion.deployment.id, // correct deploymentId (blueprint)
      undefined, // no new userId needed
      deploymentVersion.id, // reuse this deployment version
    );
  }

  async handleJobResult(msg: MQResponseDTO) {
    this.examplePushLog(msg.deploymentId, '========================');
    this.examplePushLog(msg.deploymentId, 'handleJobResult triggered');
    this.examplePushLog(
      msg.deploymentId,
      `Raw message received from queue: ${JSON.stringify(msg)}`,
    );

    // 1. Find the deployment version by deployment ID
    const depVersion = await this.deploymentVersionRepo.findOne({
      where: { id: msg.deploymentId }, // lowercase
      relations: ['deployment', 'user'],
    });

    if (!depVersion) {
      this.examplePushLog(
        msg.deploymentId,
        `Deployment version not found for ID: ${msg.deploymentId}`,
      );
      return;
    }

    this.examplePushLog(
      msg.deploymentId,
      `Found deployment version: ${depVersion.id}`,
    );

    // 2. Update status and image URL
    if (msg.success) {
      depVersion.deploymentStatus = DeploymentStatus.BUILT;
      depVersion.imageUrl = msg.imageUrl ?? null;
      this.examplePushLog(
        msg.deploymentId,
        `Build succeeded. Image URL: ${depVersion.imageUrl}`,
      );
    } else {
      depVersion.deploymentStatus = DeploymentStatus.FAILED;
      this.examplePushLog(
        msg.deploymentId,
        `Build failed: ${msg.error ?? 'Unknown error'}`,
      );
    }

    // 3. Save logs
    depVersion.buildLogsUrl = msg.logs || msg.error || null;
    this.examplePushLog(
      msg.deploymentId,
      `Build logs URL set to: ${depVersion.buildLogsUrl}`,
    );

    // 4. Persist changes in DB
    await this.deploymentVersionRepo.save(depVersion);
    this.examplePushLog(
      msg.deploymentId,
      `Deployment version ${depVersion.id} updated in DB`,
    );

    // 5. Auto-trigger deployment if build succeeded
    if (msg.success) {
      try {
        const triggerResult = await this.triggerDeployment(depVersion.id);
        this.examplePushLog(
          msg.deploymentId,
          `Deployment triggered successfully: ${JSON.stringify(triggerResult)}`,
        );
      } catch (err) {
        this.examplePushLog(
          msg.deploymentId,
          `Failed to trigger deployment: ${err}`,
        );
      }
    }

    this.examplePushLog(msg.deploymentId, '========================\n');
  }

  private createDeploymnetVersion(deploymentId: string, userId: string) {
    const depVersion = this.deploymentVersionRepo.create({
      deployment: { id: deploymentId },
      user: { id: userId },
      deploymentStatus: DeploymentStatus.PENDING,
    });

    return this.deploymentVersionRepo.save(depVersion);
  }

  examplePushLog(deploymentId: string, logLine: string) {
    // Send a log line to all clients subscribed to this deployment
    void this.deploymentGateway.sendLogLine(deploymentId, logLine);
  }
}
