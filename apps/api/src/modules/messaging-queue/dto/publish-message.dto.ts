import { IsISO8601, IsString, IsUUID } from 'class-validator';

export class PublishDeploymentMessageDto {
  @IsUUID()
  deploymentId: string;

  @IsUUID()
  userId: string;

  @IsString()
  repository: string;

  @IsString()
  branch: string;

  @IsISO8601()
  createdAt: string;
}
