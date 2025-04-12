import { IsEmail, IsString } from 'class-validator';

export class SignupDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
