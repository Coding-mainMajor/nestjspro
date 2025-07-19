import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(@Body() user: { email: string; password: string }) {
    return this.authService.login(user.email, user.password);
  }

  // http://localhost:3000/auth/signup
  @Post('signup')
  async signup(@Body() createuserDto: CreateUserDto) {
    return await this.authService.signup(createuserDto);
  }
}
