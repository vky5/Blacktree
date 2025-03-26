import { Controller } from '@nestjs/common';
import { UsersService } from '../services/users.service';
// import { Serialize } from '../../../interceptors/serialize-interceptor';
// import { UserDTO } from '../dtos/user.dto';

@Controller('users')
// @Serialize(UserDTO) // this will make the default way of displaying the response of the user as this. Can use other dto using Serialize(AdminShowUser)
export class UsersController {
  constructor(private userservice: UsersService) {}
}
