import { IsISO8601, IsString, IsUUID } from 'class-validator';

export class PublishDeploymentMessageDto {
  @IsUUID()
  deploymentId: string; // this is what we are gonna use to track all the deployments accross every microservice

  @IsString()
  token: string;

  @IsString()
  repository: string;

  @IsString()
  branch: string;

  @IsString()
  dockerFilePath: string;

  @IsString()
  contextDir: string;

  // @IsOptional()
  // @IsString()
  // portNumber?: string; // this is not needed since we are doing port mapping in the ecs routes or the routes in which server is preparing the port

  @IsISO8601()
  createdAt: string;
}
