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
    return this.userRepository.find();
  }

  public async createUser(userDto: CreateUserDto) {
    // Ensure there's always a profile object
    userDto.profile = userDto.profile ?? {};

    // Step 1: Create and save the profile entity
    const profile = this.profileRepository.create(userDto.profile);
    await this.profileRepository.save(profile);

    // Step 2: Create the user and assign the saved profile
    const user = this.userRepository.create({
      ...userDto,
      profile, // Assigning the saved profile
    });

    // Step 3: Save the user entity (with the profile relation)
    return await this.userRepository.save(user);
    // userDto.profile = userDto.profile ?? {};
    // let profile = this.profileRepository.create(userDto.profile);
    // await this.profileRepository.save(profile);

    // // let profile = this.profileRepository.create(userDto.profile);
    // const user = this.userRepository.create({
    //   ...userDto,
    //   profile, // Assigning the saved profile
    // });
    // // create User Object
    // // set the Profile
    // // save the user object
    // return await this.userRepository.save(user);
  }
}
