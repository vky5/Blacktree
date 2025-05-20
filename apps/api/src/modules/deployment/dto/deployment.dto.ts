import { IsNotEmpty, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateDeploymentDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'name must be at least 1 character long.' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  repositoryUrl: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  dockerFilePath: string;
}
