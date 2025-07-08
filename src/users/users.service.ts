import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { Profile } from 'src/profile/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}

  getAllUsers() {
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
}
