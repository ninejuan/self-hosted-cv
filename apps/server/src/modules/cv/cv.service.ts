import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Redis from 'ioredis';
import { Order } from 'sequelize';

import { SectionType } from '@/database/enums';
import { SocialLink } from '@/modules/contact/entities/social-link.entity';
import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { Writing } from '@/modules/writing/entities/writing.entity';

import { CV_CACHE_KEY, CV_CACHE_TTL_SECONDS } from './cv-cache.constants';

interface CvSectionResponse {
  section: Section;
  items: Array<
    WorkExperience | Writing | Speaking | SideProject | Education | SocialLink
  >;
}

interface CvResponse {
  profile: Profile;
  sections: CvSectionResponse[];
}

@Injectable()
export class CvService {
  constructor(
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
    @InjectModel(Section) private readonly sectionModel: typeof Section,
    @InjectModel(WorkExperience)
    private readonly experienceModel: typeof WorkExperience,
    @InjectModel(Writing) private readonly writingModel: typeof Writing,
    @InjectModel(Speaking) private readonly speakingModel: typeof Speaking,
    @InjectModel(SideProject) private readonly projectModel: typeof SideProject,
    @InjectModel(Education) private readonly educationModel: typeof Education,
    @InjectModel(SocialLink)
    private readonly socialLinkModel: typeof SocialLink,
  ) {}

  async getCv(): Promise<CvResponse> {
    const cached = await this.redis.get(CV_CACHE_KEY);

    if (cached) {
      return JSON.parse(cached) as CvResponse;
    }

    const cv = await this.buildCv();

    await this.redis.set(
      CV_CACHE_KEY,
      JSON.stringify(cv),
      'EX',
      CV_CACHE_TTL_SECONDS,
    );

    return cv;
  }

  private async buildCv(): Promise<CvResponse> {
    const profile = await this.profileModel.findOne({
      order: [['createdAt', 'ASC']],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const sections = await this.sectionModel.findAll({
      where: { profileId: profile.id, visible: true },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    const sectionResponses = await Promise.all(
      sections.map(async (section) => ({
        section,
        items: await this.getSectionItems(profile.id, section),
      })),
    );

    return { profile, sections: sectionResponses };
  }

  private getSectionItems(
    profileId: string,
    section: Section,
  ): Promise<CvSectionResponse['items']> {
    const where =
      section.type === SectionType.Contact
        ? { profileId, visible: true }
        : { profileId, sectionId: section.id, visible: true };
    const order: Order = [
      ['sortOrder', 'ASC'],
      ['createdAt', 'ASC'],
    ];

    switch (section.type) {
      case SectionType.WorkExperience:
        return this.experienceModel.findAll({ where, order });
      case SectionType.Writing:
        return this.writingModel.findAll({ where, order });
      case SectionType.Speaking:
        return this.speakingModel.findAll({ where, order });
      case SectionType.SideProject:
        return this.projectModel.findAll({ where, order });
      case SectionType.Education:
        return this.educationModel.findAll({ where, order });
      case SectionType.Contact:
        return this.socialLinkModel.findAll({ where, order });
    }
  }
}
