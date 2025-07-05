import { IsUUID } from 'class-validator';

export class DeleteDeployment {
  readonly type = 'delete';

  @IsUUID()
  deploymentId: string;
}
