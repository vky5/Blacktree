import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { Response } from 'express';

import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';
import { AccessTokenDto } from './dtos/access-token.dto';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';
import { AuthService } from './auth.service';
import { UserRole } from 'src/utils/enums/user-role.enum';
import { Serialize } from 'src/interceptors/serialize-interceptor';
import { plainToInstance } from 'class-transformer';

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

    const userInfoFromGithub = await this.authService.getGithubUserInfo(token);

    await this.userService.updateUser(req.user.id, {
      token,
      githubUsername: userInfoFromGithub.login,
      role: UserRole.DEV,
    });

    return {
      message: 'Project access granted successfully',
    };
  }

  // get the repo from the access token of the users
  @Get('/repos')
  @UseGuards(JWTClerkGuard)
  @HttpCode(HttpStatus.OK)
  async getRepos(@Req() req: RequestWithUser) {
    const token = typeof req.user.token === 'string' ? req.user.token : '';
    const repos = await this.authService.getGithubRepositories(token);

    return {
      message: 'Repositories retrieved successfully',
      length: repos.length,
      repos,
    };
  }

  // This endpoint is used to sync a user from Clerk to the local database.
  @Post('/clerk-sync')
  async syncUser(@Body() body: UserDto, @Res() res: Response) {
    const user = await this.userService.findOneByEmail(body.email);

    const safeUser = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    if (user) {
      return res.status(200).json({
        message: 'User already exists.',
        user: safeUser,
      });
    }

    const newUser = await this.userService.createFromClerk(body);

    const safeNewUser = plainToInstance(UserDto, newUser, {
      excludeExtraneousValues: true,
    });

    return res.status(201).json({
      message: 'User successfully synced.',
      user: safeNewUser,
    });
  }
  @Post('/set-token')
  setToken(@Body('jwt') jwtToken: string, @Res() res: Response) {
    if (!jwtToken) {
      return res.status(400).json({ error: 'JWT token is required' });
    }

    // Set the JWT as an HttpOnly cookie
    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'lax', // or 'none' if cross-origin
      maxAge: 60 * 60 * 24 * 90 * 1000, // 90 days in ms
      path: '/',
    });

    return res.status(200).json({ message: 'Token set successfully' });
  }
}
