import { IsEmail, IsString } from 'class-validator';

export class SigninDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
