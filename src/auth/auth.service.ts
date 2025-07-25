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
import { User } from 'src/users/user.entity';
import { ActiveUserType } from './interfaces/active-user-type.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

    return this.generateToken(user);
  }

  public async signup(createuserDto: CreateUserDto) {
    return await this.userService.createUser(createuserDto);
  }

  public async RefreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // 1. VERIFY THE REFRESH TOKEN
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.authconfig.secret,
          audience: this.authconfig.audience,
          issuer: this.authconfig.issuer,
        },
      );
      // 2. FIND THE USER FROM DB USING USER ID
      const user = await this.userService.FindUserById(sub);
      // 3. GENERATE AN ACCESS TOKEN AND REFRESH TOKEN
      return await this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.authconfig.secret,
        expiresIn: this.authconfig.expiresIn,
        audience: this.authconfig.audience,
        issuer: this.authconfig.issuer,
      },
    );
  }
  private async generateToken(user: User) {
    // GENERATE AN ACCESS TOKEN
    const accessToken = await this.signToken<Partial<ActiveUserType>>(
      user.id,
      this.authconfig.expiresIn,
      { email: user.email },
    );

    // GENERATE A REFRESH TOKEN
    const refreshToken = await this.signToken(
      user.id,
      this.authconfig.refreshTokenExpiresIn,
    );

    return { token: accessToken, refreshToken };
  }
}
