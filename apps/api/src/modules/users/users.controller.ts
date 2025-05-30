import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';

import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';
import { AccessTokenDto } from './dtos/access-token.dto';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';
import { AuthService } from './auth.service';
import { UserRole } from 'src/utils/enums/user-role.enum';
import { Serialize } from 'src/interceptors/serialize-interceptor';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // Me Route
  @Serialize(UserDto)
  @Get('me')
  @UseGuards(JWTClerkGuard)
  me(@Req() req: RequestWithUser) {
    // Return the user object from the request
    console.log('User from request:', req.user.id);
    return req.user;
  }

  // This endpoint is used to grant access to a project by providing a GitHub access token.
  @Post('/project-access')
  @UseGuards(JWTClerkGuard)
  @HttpCode(HttpStatus.OK)
  async grantProjectAccess(
    @Body() body: AccessTokenDto,
    @Req() req: RequestWithUser,
  ) {
    const token = await this.authService.getGithubAccessToken(body.code);

    await this.userService.updateUser(req.user.id, {
      token,
      role: UserRole.DEV,
    });

    return {
      message: 'Project access granted successfully',
    };
  }

  // src/auth/auth.controller.ts

  // TODO re implement this endpoint
  @Get('/repos')
  @UseGuards(JWTClerkGuard)
  @HttpCode(HttpStatus.OK)
  async getRepos(@Req() req: RequestWithUser) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      const userFromDb = await this.userService.findOneById(userId);

      if (!userFromDb || !userFromDb.token) {
        throw new UnauthorizedException('GitHub access token missing');
      }

      const repos = await this.authService.getGithubRepositories(
        userFromDb.token,
      );

      return {
        message: 'Repositories retrieved successfully',
        repos,
      };
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      throw new InternalServerErrorException('Failed to retrieve repositories');
    }
  }

  // This endpoint is used to sync a user from Clerk to the local database.
  @Post('/clerk-sync')
  @HttpCode(HttpStatus.OK)
  async syncUser(@Body() body: UserDto) {
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
