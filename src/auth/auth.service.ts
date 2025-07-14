import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import authConfig from './config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authconfig: ConfigType<typeof authConfig>,
  ) {}

  isAuthenticated: Boolean = false;

  login(email: string, pswd: string) {
    console.log(this.authconfig);
    console.log(this.authconfig.sharedSecret);
    return 'user does not exist';
  }
}
