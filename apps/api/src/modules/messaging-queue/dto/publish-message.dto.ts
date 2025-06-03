import { IsISO8601, IsString, IsUrl, IsUUID } from 'class-validator';

export class PublishDeploymentMessageDto {
  @IsUUID()
  deploymentId: string;

  @IsUUID()
  userId: string;

  @IsUrl()
  repoUrl: string;

  @IsString()
  branch: string;

  @IsISO8601()
  createdAt: string;
}
