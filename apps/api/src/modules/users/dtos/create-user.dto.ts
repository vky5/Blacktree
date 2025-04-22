import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'First name must be at least 1 character long.' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail({}, { message: 'Email is not valid.' })
  @IsNotEmpty()
  email: string;

  @IsUrl({}, { each: false })
  @IsOptional()
  imgUrl: string;

  @IsString()
  @IsOptional()
  clerkUserid: string;
}
