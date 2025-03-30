import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  // username: string; // check how to make it accessible to both user name or email
  @IsEmail({}, { message: 'Email format is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Must be of type string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
