import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
  ) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.profileModel.findOne({
      order: [['createdAt', 'ASC']],
    });

    if (!profile) {
      return this.profileModel.create({
        name: '',
        profession: '',
        location: '',
        bio: '',
        slug: 'my-cv',
        status: 'none',
        theme: 'system',
      });
    }

    return profile;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.getProfile();

    await profile.update(dto);

    return profile;
  }
}
