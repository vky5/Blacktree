import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UserDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'First name must be at least 1 character long.' })
  firstName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Expose()
  @IsEmail({}, { message: 'Email is not valid.' })
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsUrl({}, { each: false })
  @IsOptional()
  imgUrl: string;

  @IsString()
  @IsOptional()
  clerkUserid: string;

  @Expose()
  @Transform(({ obj }: { obj: { token?: string } }) => !!obj.token) // runs at the end of the transformation
  github_connect: boolean;
}
