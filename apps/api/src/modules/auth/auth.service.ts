import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async signup(email: string, password: string, name: string) {
    const checkUser = await this.usersService.findOneByEmail(email);
    if (checkUser) {
      throw new BadRequestException('Email is already in use');
    }

    password = await bcrypt.hash(password, 12);
    const newUser = await this.usersService.createUser(email, password, name);

    return this.generateJWT(newUser.id);
  }

  async signin(email: string, usrPassword: string) {
    // 1. check if user exists
    const findUser = await this.usersService.findOneByEmail(email);

    if (!findUser) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    // 2. check if the password is correct or not
    const isMatch = await this.checkPassword(usrPassword, findUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('Incorrect Email or password');
    }

    //3.  send the jwt token
    return this.generateJWT(findUser.id);
  }

  async updatePassword(id: string, password: string, newPassword: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await this.checkPassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    return this.usersService.updateUser(id, { password: newPassword });
  }

  checkPassword(rawPassword: string, encryptedPass: string) {
    return bcrypt.compare(rawPassword, encryptedPass);
  }

  generateJWT(id: string) {
    const expiresInDays = this.configService.get<number>('JWT_EXPIRES_IN');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }

    return jwt.sign({ id }, jwtSecret, {
      // we are signing jwt with id and no role
      expiresIn: expiresInDays, // JWT expiration in seconds
    });
  }
}
