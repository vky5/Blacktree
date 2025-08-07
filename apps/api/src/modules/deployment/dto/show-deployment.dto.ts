import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

// expose relevant data to the user related to deployment
export class ShowDeploymentDTO {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  name: string;

  @Expose()
  repository: string;

  @Expose()
  branch: string;

  @Expose()
  dockerFilePath: string;

  @Expose()
  contextDir: string;

  @Expose()
  portNumber: string;

  @Expose()
  resourceVersion: string;

  @Expose()
  description: string;

  @Expose()
  tag: string;

  @Expose()
  private: string;

  @Expose()
  envVariables: Record<string, string>;
}
