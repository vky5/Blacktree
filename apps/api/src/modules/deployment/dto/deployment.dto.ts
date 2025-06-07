import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDeploymentDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'name must be at least 1 character long.' })
  @Expose()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  repository: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  dockerFilePath: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  branch: string;
}
