import {
  ECSClient,
  RegisterTaskDefinitionCommand,
  RegisterTaskDefinitionCommandOutput,
  RunTaskCommand,
  RunTaskCommandOutput,
  StopTaskCommand,
  DeregisterTaskDefinitionCommand,
  StopTaskCommandOutput,
} from '@aws-sdk/client-ecs';
import { BatchDeleteImageCommand, ECRClient } from '@aws-sdk/client-ecr';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {
  private readonly ecsClient = new ECSClient({ region: 'us-east-1' });
  private readonly ecrClient = new ECRClient({ region: 'us-east-1' });

  // different resources configurations
  private readonly configMap = {
    basic: { cpu: '256', memory: '512' },
    standard: { cpu: '512', memory: '1024' },
    high: { cpu: '1024', memory: '2048' },
  };

  //TODO Replace these with actual values
  private readonly executionRoleArn =
    'arn:aws:iam::<your-account-id>:role/ecsTaskExecutionRole';
  private readonly clusterName = 'your-cluster-name';
  private readonly subnets = ['subnet-xxxx'];
  private readonly securityGroups = ['sg-xxxx'];

  // Register ECS Task Definition
  async registerTaskDefinition(
    imageUrl: string,
    envVars: Record<string, string>,
    portNumber: number,
    resourceVersion: 'basic' | 'standard' | 'high',
  ): Promise<string> {
    const config = this.configMap[resourceVersion] || this.configMap.basic;

    const registerCmd = new RegisterTaskDefinitionCommand({
      family: 'blacktree-job-runner',
      requiresCompatibilities: ['FARGATE'],
      cpu: config.cpu,
      memory: config.memory,
      networkMode: 'awsvpc',
      executionRoleArn: this.executionRoleArn,
      containerDefinitions: [
        {
          name: 'runner',
          image: imageUrl,
          essential: true,
          portMappings: [
            {
              containerPort: portNumber,
              protocol: 'tcp',
            },
          ],
          environment: Object.entries(envVars).map(([key, value]) => ({
            name: key,
            value,
          })),
        },
      ],
    });

    const response: RegisterTaskDefinitionCommandOutput =
      await this.ecsClient.send(registerCmd);
    const taskDefArn: string | undefined =
      response.taskDefinition?.taskDefinitionArn;

    if (!taskDefArn) throw new Error('Task Definition registration failed.');

    return taskDefArn;
  }

  // Run Container on Fargate using a registered Task Definition
  async runContainer(taskDefArn: string): Promise<string> {
    const runCmd = new RunTaskCommand({
      cluster: this.clusterName,
      taskDefinition: taskDefArn,
      count: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: this.subnets,
          assignPublicIp: 'ENABLED',
          securityGroups: this.securityGroups,
        },
      },
    });

    const response: RunTaskCommandOutput = await this.ecsClient.send(runCmd);
    const taskArn: string | undefined = response.tasks?.[0]?.taskArn;

    if (!taskArn) throw new Error('Failed to launch ECS task.');

    return taskArn;
  }

  // stop the container from the ARN
  stopContainer(taskArn: string): Promise<StopTaskCommandOutput> {
    const stopCommand = new StopTaskCommand({
      cluster: this.clusterName,
      task: taskArn,
      reason: 'stopping from Blacktree',
    });

    return this.ecsClient.send(stopCommand);
  }

  // deregister the task definition
  deregisterTaskDefinition(taskDefinitionArn: string) {
    const cmd = new DeregisterTaskDefinitionCommand({
      taskDefinition: taskDefinitionArn,
    });
    return this.ecsClient.send(cmd);
  }

  // deleting the ECR image
  deleteEcrImage(imageUri: string) {
    const [, repoName, tag] = imageUri.match(/([^/]+)\/([^:]+):(.+)$/) || [];
    if (!repoName || !tag) return;

    const cmd = new BatchDeleteImageCommand({
      repositoryName: repoName,
      imageIds: [{ imageTag: tag }],
    });

    return this.ecrClient.send(cmd);
  }
}

// NOTE
/*
A little about vCPUs in ECS fargate
in ECS 1024 = 1 entire core of CPU but that is vCPU so 
256 = 1/4 of 1 vCPU 

vCPU means all infra are using the same threads and so if the container is not using, its cpu drops and if it does its cpu exceeds but
not exceeds that
*/
