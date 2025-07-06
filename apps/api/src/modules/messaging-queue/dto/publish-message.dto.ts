import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class PublishDeploymentMessageDto {
  @IsUUID()
  deploymentId: string;

  @IsString()
  token: string;

  @IsString()
  repository: string;

  @IsString()
  branch: string;

  @IsString()
  dockerFilePath: string;

  @IsOptional()
  @IsString()
  composeFilePath?: string;

  @IsString()
  contextDir: string;

  @IsOptional()
  @IsString()
  portNumber?: string;

  @IsISO8601()
  createdAt: string;

  readonly type = 'build';
}
