import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Redis from 'ioredis';

import { CV_CACHE_KEY } from '@/modules/cv/cv-cache.constants';
import { CvTemplate } from '@/modules/template/entities/cv-template.entity';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
    @InjectModel(CvTemplate)
    private readonly templateModel: typeof CvTemplate,
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
  ) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.profileModel.findOne({
      include: [{ model: CvTemplate, as: 'cvTemplate' }],
      order: [['createdAt', 'ASC']],
    });

    if (!profile) {
      const template = await this.getDefaultTemplate();
      const created = await this.profileModel.create({
        name: '',
        profession: '',
        location: '',
        bio: '',
        slug: 'my-cv',
        status: 'none',
        theme: 'system',
        cvTemplateId: template.id,
      });

      const createdProfile = await this.profileModel.findByPk(created.id, {
        include: [{ model: CvTemplate, as: 'cvTemplate' }],
      });

      if (!createdProfile) {
        throw new BadRequestException('Failed to create profile');
      }

      return createdProfile;
    }

    return profile;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.getProfile();

    if (dto.cvTemplateId) {
      const template = await this.templateModel.findOne({
        where: { id: dto.cvTemplateId, isActive: true },
      });

      if (!template) {
        throw new BadRequestException('Invalid or inactive CV template');
      }
    }

    await profile.update(dto);
    await this.redis.del(CV_CACHE_KEY);

    return this.getProfile();
  }

  private async getDefaultTemplate(): Promise<CvTemplate> {
    const template = await this.templateModel.findOne({
      where: { key: 'readcv', isActive: true },
    });

    if (!template) {
      throw new BadRequestException('Default CV template is not available');
    }

    return template;
  }
}
