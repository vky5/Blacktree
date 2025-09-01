import {
  ECSClient,
  RegisterTaskDefinitionCommand,
  RegisterTaskDefinitionCommandOutput,
  RunTaskCommand,
  RunTaskCommandOutput,
  StopTaskCommand,
  DeregisterTaskDefinitionCommand,
  StopTaskCommandOutput,
  AssignPublicIp,
} from '@aws-sdk/client-ecs';
import { BatchDeleteImageCommand, ECRClient } from '@aws-sdk/client-ecr';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private readonly ecsClient: ECSClient;
  private readonly ecrClient: ECRClient;

  private executionRoleArn: string;
  private clusterName: string;
  private subnets: string[];
  private securityGroups: string[];

  // different resources configurations
  private readonly configMap = {
    basic: { cpu: '256', memory: '512' },
    standard: { cpu: '512', memory: '1024' },
    high: { cpu: '1024', memory: '2048' },
  };

  constructor(private readonly configService: ConfigService) {
    this.executionRoleArn = this.configService.get<string>('EXECUTIONROLEARN')!;
    this.clusterName = this.configService.get<string>('CLUSTERNAME')!;

    const raw = this.configService.get<string>('SUBNET'); // because it adds '["". ""]' outside array so it was causing issue
    try {
      this.subnets = JSON.parse(raw ?? '[]') as string[];
    } catch {
      throw new Error('Invalid JSON in SUBNET env var');
    }

    const raw2 = this.configService.get<string>('SECURITY_GROUP');
    try {
      this.securityGroups = JSON.parse(raw2 ?? '[]') as string[];
    } catch {
      throw new Error('Invalid JSON in SUBNET env var');
    }

    // AWS Clients with credentials from env variables only
    this.ecsClient = new ECSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.ecrClient = new ECRClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
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

  // Run Container on Fargate using a registered Task Definition
  async runContainer(taskDefArn: string): Promise<string> {
    try {
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

      console.log('[ECS] Running task with config:', {
        cluster: this.clusterName,
        taskDefinition: taskDefArn,
        subnets: this.subnets,
        securityGroups: this.securityGroups,
      });

      const response: RunTaskCommandOutput = await this.ecsClient.send(runCmd);

      if (!response.tasks?.length || !response.tasks[0].taskArn) {
        console.error('[ECS] No tasks launched. Failures:', response.failures);
        if (response.failures && response.failures.length > 0) {
          for (const failure of response.failures) {
            console.error('ECS Task failure:', failure.arn, failure.reason);
          }
        }

        throw new Error(
          'ECS failed to launch task: ' + JSON.stringify(response.failures),
        );
      }

      return response.tasks[0].taskArn;
    } catch (err) {
      console.error('[ECS ERROR]', err);
      throw new Error('Failed to launch ECS task: ' + (err as Error).message);
    }
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

  // restarting the ECS from taskARN
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

// NOTE
/*
A little about vCPUs in ECS fargate
in ECS 1024 = 1 entire core of CPU but that is vCPU so 
256 = 1/4 of 1 vCPU 

vCPU means all infra are using the same threads and so if the container is not using, its cpu drops and if it does its cpu exceeds but
not exceeds that
*/
