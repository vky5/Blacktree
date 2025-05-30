import { IsString, IsNotEmpty } from 'class-validator';

export class AccessTokenDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
