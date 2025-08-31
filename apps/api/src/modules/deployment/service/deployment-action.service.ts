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
import { MQResponseDTO } from 'src/modules/response-handler/mq-response.dto';

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
    this.messageingQueueService.publishMessage('worker.execute', message);
  }

  async triggerDeployment(deploymentVersionId: string) {
    try {
      // 1. Fetch deployment along with the latest version
      const deploymentHosted = await this.deploymentVersionRepo.findOne({
        where: { id: deploymentVersionId },
        relations: ['deployment'],
      });

      if (!deploymentHosted) {
        throw new NotFoundException('no hosted deployemnt found');
      }

      // if taskarn is present
      if (deploymentHosted.taskArn) {
        try {
          await this.awsService.stopContainer(deploymentHosted.taskArn);
        } catch (error) {
          console.log(error);
          throw new InternalServerErrorException(
            'Something went wrong with container stopping',
          );
        }
      }

      // if taskdefinitionarn is already there, deregister it and then register it again
      if (deploymentHosted.taskDefinitionArn) {
        try {
          await this.awsService.deregisterTaskDefinition(
            deploymentHosted.taskDefinitionArn,
          );
        } catch (error) {
          console.log(error);
          throw new InternalServerErrorException(
            'Something went wrong with task definition',
          );
        }
      }

      // checking if the imageUrl exists or not
      if (!deploymentHosted.imageUrl) {
        throw new NotFoundException(
          'Can not launch the deployment, no image url present',
        );
      }

      // 2. Register Task Definition on ECS with given config
      const taskDefArn = await this.awsService.registerTaskDefinition(
        deploymentHosted.imageUrl,
        deploymentHosted.deployment.envVars || {},
        parseInt(deploymentHosted.deployment.portNumber || '3000'), // fallback port
        deploymentHosted.deployment.resourceVersion,
      );

      // 4. Run the container based on the task definition
      const taskArn = await this.awsService.runContainer(taskDefArn);

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
      console.error('Error in triggerDeployment:', err);
      throw err;
    }
  }

  // stopping the deployment
  async stopDeployment(deploymentVersionId: string) {
    const res = await this.deploymentVersionRepo.findOne({
      where: { id: deploymentVersionId },
    });

    if (!res) {
      throw new NotFoundException('No deployment found');
    }

    if (!res.taskArn) {
      throw new Error('Task ARN is missing. Cannot stop container.');
    }

    await this.awsService.stopContainer(res?.taskArn);

    res.deploymentStatus = DeploymentStatus.STOPPED; // updating the status of the deployment
    await this.deploymentVersionRepo.save(res);
  }

  // soft deleting the contianer
  // stop the container, deregister the task definition, delete the image from ECR
  async cleanResources(deploymentVersionId: string) {
    const deployment = await this.deploymentVersionRepo.findOne({
      where: { id: deploymentVersionId }, // eager is true so no need to define relation
    });

    if (!deployment) {
      throw new NotFoundException('Deployment or version not found');
    }

    const { taskArn, taskDefinitionArn, imageUrl } = deployment;

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
      deployment.deploymentStatus = DeploymentStatus.STOPPED;
      deployment.taskArn = null;
      deployment.taskDefinitionArn = null;
      deployment.imageUrl = null;
      deployment.buildLogsUrl = null;
      deployment.runTimeLogsUrl = null;

      await this.deploymentVersionRepo.save(deployment);
      return deployment; // since we are returning the deployment we can get the req.user from here but
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to clean resources.');
    }
  }

  // restarting the ECS from task arn
  async restartDeployment(deploymentVersionId: string) {
    try {
      const deployment = await this.deploymentVersionRepo.findOne({
        where: { id: deploymentVersionId },
      });
      if (!deployment || !deployment.taskDefinitionArn) {
        throw new BadRequestException(
          'Didnt find any deployment for this ID to restart',
        );
      }

      await this.awsService.restartTask(deployment.taskDefinitionArn);

      return {
        status: 'success',
        message: 'Deployment restarted successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }

  // to redeploy the new built
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
      throw new BadRequestException('Deployment version not found');
    }

    await this.cleanResources(deploymentVersionId);

    return this.buildDeployment(
      deploymentVersion.deployment.id, // correct deploymentId (blueprint)
      undefined, // no new userId needed
      deploymentVersion.id, // reuse this deployment version
    );
  }

  async handleJobResult(msg: MQResponseDTO) {
    // 1. Find the deployment version by deployment ID
    const depVersion = await this.deploymentVersionRepo.findOne({
      where: { id: msg.DeploymentID },
      relations: ['deployment', 'user'],
    });

    if (!depVersion) {
      console.error(`Deployment version not found for ID: ${msg.DeploymentID}`);
      return;
    }

    // if (!msg.ImageURL) {
    //   throw new InternalServerErrorException('Image URL is not present');
    // }

    // 2. Update status based on success/failure
    if (msg.Success) {
      depVersion.deploymentStatus = DeploymentStatus.BUILT;
      depVersion.imageUrl = msg.ImageURL; // save ECR image URL
    } else {
      depVersion.deploymentStatus = DeploymentStatus.FAILED;
    }

    // 3. Save logs
    depVersion.buildLogsUrl = msg.Logs || null;

    // 4. Optionally save error message if failed
    if (!msg.Success && msg.Error) {
      depVersion.buildLogsUrl = msg.Error; // you may need to add this field in entity
    }

    await this.deploymentVersionRepo.save(depVersion);

    // 5. Optional: auto-trigger deployment if build succeeded
    if (msg.Success) {
      try {
        await this.triggerDeployment(depVersion.id);
      } catch (err) {
        console.error(
          `Failed to trigger deployment for version ${depVersion.id}`,
          err,
        );
      }
    }

    console.log(`Handled job result for deployment version ${depVersion.id}`);
  }

  private createDeploymnetVersion(deploymentId: string, userId: string) {
    const depVersion = this.deploymentVersionRepo.create({
      deployment: { id: deploymentId },
      user: { id: userId },
      deploymentStatus: DeploymentStatus.PENDING,
    });

    return this.deploymentVersionRepo.save(depVersion);
  }
}
