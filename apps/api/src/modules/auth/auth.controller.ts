import { Body, Controller } from '@nestjs/common';
import { SignupDTO } from './dtos/signup.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  signup(@Body() body: SignupDTO) {
    return this.authService.signup(body.email, body.password, body.name);
  }
}
