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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authconfig: ConfigType<typeof authConfig>,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
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
    // 3. IF THE PASSWORD MATCH, LOGIN SUCCESS- RETURN ACCESSTOKEN
    // GENERATE JWT & SEND IT IN THE RESPONSE
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.authconfig.secret,
        expiresIn: this.authconfig.expiresIn,
        audience: this.authconfig.audience,
        issuer: this.authconfig.issuer,
      },
    );
    return {
      token: token,
    };
  }

  public async signup(createuserDto: CreateUserDto) {
    return await this.userService.createUser(createuserDto);
  }
}
