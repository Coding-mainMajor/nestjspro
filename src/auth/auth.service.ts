import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import authConfig from './config/auth.config';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { HashingProvider } from './provider/hashing.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authconfig: ConfigType<typeof authConfig>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  isAuthenticated: Boolean = false;

  public async login(loginDto: LoginDto) {
    // 1. FIND THE USER WITH USERNAME
    let user = await this.userService.findUserByUsername(loginDto.username);

    // 2. IF USER IS AVAILABLE, COMPARE THE PASSWORD
    let isEqual: boolean = false;
    isEqual = await this.hashingProvider.comparePassword(
      loginDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }
    // 3. IF THE PASSWORD MATHCH, LOGIN SUCDESS- RETURN ACCESSTOKEN
    // SEND THE RESPONSE
    return {
      data: user,
      success: true,
      message: 'User logged in successfully',
    };
  }

  public async signup(createuserDto: CreateUserDto) {
    return await this.userService.createUser(createuserDto);
  }
}
