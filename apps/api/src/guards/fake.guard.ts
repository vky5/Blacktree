import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

@Injectable()
export class FakeGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user = await this.userService.findOneByEmail('vky0579@gmail.com');

    if (!user) {
      throw new Error('Fake user not found in database');
    }

    (request as RequestWithUser).user = user;

    return true;
  }
}
