import {
  ECSClient,
  RegisterTaskDefinitionCommand,
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

  private readonly configMap = {
    basic: { cpu: '256', memory: '512' },
    standard: { cpu: '512', memory: '1024' },
    high: { cpu: '1024', memory: '2048' },
  };

  constructor(private readonly configService: ConfigService) {
    this.executionRoleArn = this.configService.get<string>('EXECUTIONROLEARN')!;
    this.clusterName = this.configService.get<string>('CLUSTERNAME')!;
    this.subnets = JSON.parse(this.configService.get<string>('SUBNET') ?? '[]');
    this.securityGroups = JSON.parse(
      this.configService.get<string>('SECURITY_GROUP') ?? '[]',
    );

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
          image: imageUrl, // MUST include UUID tag
          essential: true,
          portMappings: [{ containerPort: portNumber, protocol: 'tcp' }],
          environment: Object.entries(envVars).map(([name, value]) => ({
            name,
            value,
          })),
        },
      ],
    });

    const response = await this.ecsClient.send(registerCmd);
    if (!response.taskDefinition?.taskDefinitionArn)
      throw new Error('Task registration failed');

    return response.taskDefinition.taskDefinitionArn;
  }

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
    if (!response.tasks?.[0]?.taskArn)
      throw new Error('Failed to run ECS task');
    return response.tasks[0].taskArn;
  }

  stopContainer(taskArn: string): Promise<StopTaskCommandOutput> {
    return this.ecsClient.send(
      new StopTaskCommand({
        cluster: this.clusterName,
        task: taskArn,
        reason: 'stopping from Blacktree',
      }),
    );
  }

  deregisterTaskDefinition(taskDefinitionArn: string) {
    return this.ecsClient.send(
      new DeregisterTaskDefinitionCommand({
        taskDefinition: taskDefinitionArn,
      }),
    );
  }

  deleteEcrImage(imageUrl: string) {
    const match = imageUrl.match(/^.+\.amazonaws\.com\/(.+):(.+)$/);
    if (!match) return;
    const [, repositoryName, imageTag] = match;
    return this.ecrClient.send(
      new BatchDeleteImageCommand({ repositoryName, imageIds: [{ imageTag }] }),
    );
  }
}
