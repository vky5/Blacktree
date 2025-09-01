import {
  ECSClient,
  RegisterTaskDefinitionCommand,
  RegisterTaskDefinitionCommandOutput,
  RunTaskCommand,
  RunTaskCommandOutput,
  StopTaskCommand,
  StopTaskCommandOutput,
  DeregisterTaskDefinitionCommand,
  AssignPublicIp,
} from '@aws-sdk/client-ecs';
import { BatchDeleteImageCommand, ECRClient } from '@aws-sdk/client-ecr';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private readonly ecsClient = new ECSClient({ region: 'us-east-1' });
  private readonly ecrClient = new ECRClient({ region: 'us-east-1' });

  private executionRoleArn: string;
  private clusterName: string;
  private subnets: string[];
  private securityGroups: string[];

  private readonly configMap = {
    basic: { cpu: '256', memory: '512' },
    standard: { cpu: '512', memory: '1024' },
    high: { cpu: '1024', memory: '2048' },
  };

  constructor(private readonly configService: ConfigService) {
    this.executionRoleArn = this.configService.get<string>('EXECUTIONROLEARN')!;
    this.clusterName = this.configService.get<string>('CLUSTERNAME')!;

    const rawSubnets = this.configService.get<string>('SUBNET');
    try {
      this.subnets = JSON.parse(rawSubnets ?? '[]') as string[];
    } catch {
      throw new Error('Invalid JSON in SUBNET env var');
    }

    const rawSgs = this.configService.get<string>('SECURITY_GROUP');
    try {
      this.securityGroups = JSON.parse(rawSgs ?? '[]') as string[];
    } catch {
      throw new Error('Invalid JSON in SECURITY_GROUP env var');
    }
  }

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

  // Run container
  async runContainer(taskDefArn: string): Promise<string> {
    const runCmd = new RunTaskCommand({
      cluster: this.clusterName,
      taskDefinition: taskDefArn,
      count: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: this.subnets,
          assignPublicIp: AssignPublicIp.ENABLED,
          securityGroups: this.securityGroups,
        },
      },
    });

    const response: RunTaskCommandOutput = await this.ecsClient.send(runCmd);

    if (!response.tasks?.length || !response.tasks[0].taskArn) {
      console.error('ECS task failures:', response.failures);
      throw new Error(
        'ECS failed to launch task: ' + JSON.stringify(response.failures),
      );
    }

    return response.tasks[0].taskArn;
  }

  // Stop container
  stopContainer(taskArn: string): Promise<StopTaskCommandOutput> {
    const stopCommand = new StopTaskCommand({
      cluster: this.clusterName,
      task: taskArn,
      reason: 'stopping from Blacktree',
    });
    return this.ecsClient.send(stopCommand);
  }

  // Deregister task definition
  deregisterTaskDefinition(taskDefinitionArn: string) {
    const cmd = new DeregisterTaskDefinitionCommand({
      taskDefinition: taskDefinitionArn,
    });
    return this.ecsClient.send(cmd);
  }

  // Delete ECR image
  deleteEcrImage(imageUrl: string) {
    const match = imageUrl.match(/^.+\.amazonaws\.com\/(.+):(.+)$/);
    if (!match) return;

    const [, repositoryName, imageTag] = match;

    const cmd = new BatchDeleteImageCommand({
      repositoryName,
      imageIds: [{ imageTag }],
    });

    return this.ecrClient.send(cmd);
  }

  // Restart ECS task (this is the method your NestJS code needs)
  async restartTask(taskDefinitionArn: string): Promise<RunTaskCommandOutput> {
    const runCmd = new RunTaskCommand({
      cluster: this.clusterName,
      taskDefinition: taskDefinitionArn,
      launchType: 'FARGATE',
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: this.subnets,
          assignPublicIp: 'ENABLED',
          securityGroups: this.securityGroups,
        },
      },
    });

    return this.ecsClient.send(runCmd);
  }
}
