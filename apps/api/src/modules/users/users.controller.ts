import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';

import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('hello')
  @UseGuards(JWTClerkGuard)
  @HttpCode(HttpStatus.OK)
  hello() {
    return {
      message: 'Hello from the backend',
    };
  }

  @Post('/clerk-sync')
  @HttpCode(HttpStatus.OK)
  async syncUser(@Body() body: CreateUserDto) {
    const user = await this.userService.findOneByEmail(body.email);

    if (user) {
      return {
        status: 'existing',
        message: 'User already exists.',
        user,
      };
    }

    const newUser = await this.userService.createFromClerk(body);
    return {
      status: 'created',
      message: 'User successfully synced.',
      user: newUser,
    };
  }
}
