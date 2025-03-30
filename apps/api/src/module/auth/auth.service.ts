import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { SignupDTO } from './dtos/signup.dto';
import { SigninDto } from './dtos/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async signup(body: SignupDTO) {
    // first check if the user already exists in the DB
    const user = await this.userService.findUserByEmail(body.email);

    if (user) {
      throw new BadRequestException('Email is already in use. Please login');
    }

    const newUser = await this.userService.createUsers(
      body.email,
      body.password,
      body.name,
    );

    return this.generateJWT(newUser.id);
  }

  // for signin
  async signin(body: SigninDto) {
    const user = await this.userService.findUserByEmail(body.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email id or password');
    }

    const isMatch = await user.verifyPassword(body.password);

    if (!isMatch) {
      throw new UnauthorizedException('invalid email id or password');
    }

    this.generateJWT(user.id);
  }

  // to generate
  generateJWT(id: string) {
    const expiresInDays = this.configService.get<number>('JWT_EXPIRES_IN');
    const expiresInSeconds = (expiresInDays ?? 7) * 24 * 60 * 60; // Convert days to seconds, default to 7 days if undefined

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }

    return jwt.sign({ id }, jwtSecret, {
      expiresIn: expiresInSeconds, // JWT expiration in seconds
    });
  }
}
