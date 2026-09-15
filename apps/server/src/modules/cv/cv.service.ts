import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Redis from 'ioredis';
import { Order } from 'sequelize';

import { SectionType } from '@/database/enums';
import { SocialLink } from '@/modules/contact/entities/social-link.entity';
import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { Media } from '@/modules/media/entities/media.entity';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { CvTemplate } from '@/modules/template/entities/cv-template.entity';
import { Writing } from '@/modules/writing/entities/writing.entity';

import { CV_CACHE_KEY, CV_CACHE_TTL_SECONDS } from './cv-cache.constants';

interface CvSectionResponse {
  section: Section;
  items: Array<
    WorkExperience | Writing | Speaking | SideProject | Education | SocialLink
  >;
}

type JsonRecord = Record<string, unknown>;
type SerializableModel = { toJSON: () => unknown };

export interface CvResponse {
  profile: Profile | JsonRecord;
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
    @InjectModel(Media) private readonly mediaModel: typeof Media,
  ) {}

  async getCv(): Promise<CvResponse | null> {
    const cached = await this.redis.get(CV_CACHE_KEY);

    if (cached) {
      return JSON.parse(cached) as CvResponse;
    }

    const cv = await this.buildCv();

    if (cv) {
      await this.redis.set(
        CV_CACHE_KEY,
        JSON.stringify(cv),
        'EX',
        CV_CACHE_TTL_SECONDS,
      );
    }

    return cv;
  }

  private async buildCv(): Promise<CvResponse | null> {
    const profile = await this.profileModel.findOne({
      include: [{ model: CvTemplate, as: 'cvTemplate' }],
      order: [['createdAt', 'ASC']],
    });

    if (!profile) {
      return null;
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

    const profileJson = this.toJsonRecord(profile);
    if (profile.cvTemplate) {
      profileJson.cvTemplate = this.toJsonRecord(profile.cvTemplate);
    }

    return { profile: profileJson, sections: sectionResponses };
  }

  private toJsonRecord(model: SerializableModel): JsonRecord {
    const value = model.toJSON();

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as JsonRecord;
    }

    return {};
  }

  private async getSectionItems(
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
        return this.withMedia(
          await this.experienceModel.findAll({ where, order }),
          'experience',
        );
      case SectionType.Writing:
        return this.writingModel.findAll({ where, order });
      case SectionType.Speaking:
        return this.withMedia(
          await this.speakingModel.findAll({ where, order }),
          'speaking',
        );
      case SectionType.SideProject:
        return this.withMedia(
          await this.projectModel.findAll({ where, order }),
          'side_project',
        );
      case SectionType.Education:
        return this.educationModel.findAll({ where, order });
      case SectionType.Contact:
        return this.socialLinkModel.findAll({ where, order });
    }
  }

  private async withMedia<
    T extends { id: string; toJSON: () => Record<string, unknown> },
  >(items: T[], entityType: string): Promise<T[]> {
    const ids = items.map((i) => i.id);
    const media = ids.length
      ? await this.mediaModel.findAll({
          where: { entityType, entityId: ids, status: 'attached' },
          order: [['sortOrder', 'ASC']],
        })
      : [];
    return items.map((item) => {
      const json = item.toJSON();
      json.media = media
        .filter((m) => m.entityId === item.id)
        .map((m) => ({ url: m.publicUrl, alt: m.altText }));
      return json as unknown as T;
    });
  }
}
