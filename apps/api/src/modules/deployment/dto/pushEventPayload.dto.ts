import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class AuthorDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

class CommitDto {
  @IsString()
  id: string;

  @IsString()
  message: string;

  @IsString()
  timestamp: string;

  @ValidateNested()
  @Type(() => AuthorDto)
  author: AuthorDto;
}

class RepositoryDto {
  @IsString()
  full_name: string;

  @IsString()
  clone_url: string;
}

class SenderDto {
  @IsString()
  login: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class PushEventPayloadDto {
  @IsString()
  ref: string;

  @ValidateNested()
  @Type(() => CommitDto)
  head_commit: CommitDto;

  @ValidateNested()
  @Type(() => RepositoryDto)
  repository: RepositoryDto;

  @ValidateNested()
  @Type(() => SenderDto)
  sender: SenderDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommitDto)
  commits?: CommitDto[];
}
