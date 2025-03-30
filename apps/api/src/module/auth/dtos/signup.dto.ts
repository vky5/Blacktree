import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Email format is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 character' })
  @IsString({ message: 'Must be of type string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
