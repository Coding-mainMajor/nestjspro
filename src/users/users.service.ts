import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  getAllUsers() {
    const environment = this.configService.get<string>('ENV_MODE');
    console.log(environment);
    return this.userRepository.find({
      relations: {
        profile: true,
      },
    });
  }

  public async createUser(userDto: CreateUserDto) {
    // Create a profile and save

    userDto.profile = userDto.profile ?? {};

    // Create User Object
    const user = this.userRepository.create({
      ...userDto,
      profile: userDto.profile ?? undefined, // ensure null isn't passed
    });

    // save the user object
    return await this.userRepository.save(user);
  }

  public async deleteUser(id: number) {
    // delete user
    await this.userRepository.delete(id);

    // send a response\
    return { deleted: true };
  }

  public async FindUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }
}
