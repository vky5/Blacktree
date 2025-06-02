import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateDeploymentDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'name must be at least 1 character long.' })
  @Expose()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Expose()
  repositoryUrl: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Expose()
  dockerFilePath: string;
}
