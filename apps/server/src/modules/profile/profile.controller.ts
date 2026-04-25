import { Body, Controller, Get, Put } from '@nestjs/common';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';

@Controller('admin/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    getProfile(): Promise<Profile> {
        return this.profileService.getProfile();
    }

    @Put()
    updateProfile(@Body() dto: UpdateProfileDto): Promise<Profile> {
        return this.profileService.updateProfile(dto);
    }
}
