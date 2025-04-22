import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

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
