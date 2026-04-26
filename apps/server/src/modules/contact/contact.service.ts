import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { Inject } from '@nestjs/common';

import { SectionType } from '@/database/enums';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';

import { CreateContactDto } from './dto/create-contact.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { SocialLink } from './entities/social-link.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(SocialLink)
    private readonly socialLinkModel: typeof SocialLink,
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
    @InjectModel(Section) private readonly sectionModel: typeof Section,
    @Inject(getConnectionToken()) private readonly sequelize: Sequelize,
  ) {}

  findAll(): Promise<SocialLink[]> {
    return this.socialLinkModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  async create(dto: CreateContactDto): Promise<SocialLink> {
    let profileId = dto.profileId;

    if (!profileId) {
      const profile = await this.profileModel.findOne({
        order: [['createdAt', 'ASC']],
      });
      if (!profile)
        throw new NotFoundException(
          'No profile found. Create a profile first.',
        );
      profileId = profile.id;
    }

    const existingSection = await this.sectionModel.findOne({
      where: { profileId, type: SectionType.Contact },
    });

    if (!existingSection) {
      await this.sectionModel.create({
        profileId,
        type: SectionType.Contact,
        title: 'Contact',
        sortOrder: 99,
        visible: true,
      });
    }

    return this.socialLinkModel.create({
      ...dto,
      profileId,
      sortOrder: dto.sortOrder ?? 0,
      visible: dto.visible ?? true,
    });
  }

  async update(id: string, dto: UpdateContactDto): Promise<SocialLink> {
    const item = await this.findOne(id);

    await item.update(dto);

    return item;
  }

  async delete(id: string): Promise<{ id: string }> {
    const item = await this.findOne(id);

    await item.destroy();

    return { id };
  }

  async reorder(dto: ReorderDto): Promise<SocialLink[]> {
    await this.sequelize.transaction(async (transaction) => {
      await Promise.all(
        dto.items.map((item) =>
          this.socialLinkModel.update(
            { sortOrder: item.sortOrder },
            { where: { id: item.id }, transaction },
          ),
        ),
      );
    });

    return this.findAll();
  }

  private async findOne(id: string): Promise<SocialLink> {
    const item = await this.socialLinkModel.findByPk(id);

    if (!item) {
      throw new NotFoundException('Contact link not found');
    }

    return item;
  }
}
