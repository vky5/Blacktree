import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignupDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
