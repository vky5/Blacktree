import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsObject,
} from 'class-validator';

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
  contextDir: string;

  @IsString()
  @IsOptional()
  @Expose()
  portNumber: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  branch: string;

  @IsOptional()
  @IsObject()
  @Expose()
  envVars: Record<string, string>;

  @IsOptional()
  @Expose()
  autoDeploy: boolean;

  // FIXME not adding custom url support but will think about it
  // @IsOptional()
  // @IsUrl({}, { message: 'Must be a valid URL' })
  // @Expose()
  // deployedUrl?: string;
}

// this is the data that is stored in the database
