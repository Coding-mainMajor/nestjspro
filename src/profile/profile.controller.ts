import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileservice: ProfileService) {}

  @Get()
  public getProfiles() {
    return this.profileservice.getAllProfiles();
  }
}
