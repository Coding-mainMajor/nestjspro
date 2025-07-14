import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { error, table } from 'console';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  public async getAllUsers() {
    try {
      return await this.userRepository.find({
        relations: {
          profile: true,
        },
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occured. please try again later',
          {
            description: 'Could not connect to database',
          },
        );
      }
      console.log(error);
    }
  }

  public async createUser(userDto: CreateUserDto) {
    try {
      // Create a profile and save

      userDto.profile = userDto.profile ?? {};

      // check if user with same username/email already exist
      const existingUser = await this.userRepository.findOne({
        where: [{ username: userDto.username }, { email: userDto.email }],
      });
      if (existingUser) {
        throw new BadRequestException(
          'there is already a user with given username / email',
        );
      }

      // Create User Object
      const user = this.userRepository.create({
        ...userDto,
        profile: userDto.profile ?? undefined, // ensure null isn't passed
      });

      // save the user object
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new RequestTimeoutException(
          'An error has occured. please try again later',
          {
            description: 'Could not connect to database',
          },
        );
      }
      // if (error.code === '23505') {
      //   throw new BadRequestException(
      //     'there is some duplicate value for user in database',
      //   );
      // }
      throw error;
    }
  }

  public async deleteUser(id: number) {
    // delete user
    await this.userRepository.delete(id);

    // send a response\
    return { deleted: true };
  }

  public async FindUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `The user with ID ${id} was not found`,
          table: 'user',
        },
        HttpStatus.NOT_FOUND,
        {
          description:
            'The exception occured because a user with ID' +
            id +
            'was not found in users table.',
        },
      );
    }
    return user;
  }
}
