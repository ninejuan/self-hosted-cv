import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { SectionType } from '@/database/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { Inject } from '@nestjs/common';

import { CreateEducationDto } from './dto/create-education.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Education } from './entities/education.entity';

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education) private readonly educationModel: typeof Education,
    @Inject(getConnectionToken()) private readonly sequelize: Sequelize,
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
    @InjectModel(Section) private readonly sectionModel: typeof Section,
  ) {}

  private async resolveIds(dto: { profileId?: string; sectionId?: string }): Promise<{ profileId: string; sectionId: string }> {
    let profileId = dto.profileId;
    let sectionId = dto.sectionId;

    if (!profileId) {
      const profile = await this.profileModel.findOne({ order: [['createdAt', 'ASC']] });
      if (!profile) throw new NotFoundException('No profile found. Create a profile first.');
      profileId = profile.id;
    }

    if (!sectionId) {
      const section = await this.sectionModel.findOne({
        where: { profileId, type: SectionType.Education },
      });
      if (section) {
        sectionId = section.id;
      } else {
        const created = await this.sectionModel.create({
          profileId,
          type: 'education' as SectionType,
          title: 'Education',
          sortOrder: 0,
          visible: true,
        });
        sectionId = created.id;
      }
    }

    return { profileId, sectionId };
  }

  findAll(): Promise<Education[]> {
    return this.educationModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['startDate', 'DESC'],
      ],
    });
  }

  async create(dto: CreateEducationDto): Promise<Education> {
    const { profileId, sectionId } = await this.resolveIds(dto);

    return this.educationModel.create({
      ...dto,
      profileId,
      sectionId,
      sortOrder: dto.sortOrder ?? 0,
      visible: dto.visible ?? true,
    });
  }

  async update(id: string, dto: UpdateEducationDto): Promise<Education> {
    const item = await this.findOne(id);

    await item.update(dto);

    return item;
  }

  async delete(id: string): Promise<{ id: string }> {
    const item = await this.findOne(id);

    await item.destroy();

    return { id };
  }

  async reorder(dto: ReorderDto): Promise<Education[]> {
    await this.sequelize.transaction(async (transaction) => {
      await Promise.all(
        dto.items.map((item) =>
          this.educationModel.update(
            { sortOrder: item.sortOrder },
            { where: { id: item.id }, transaction },
          ),
        ),
      );
    });

    return this.findAll();
  }

  private async findOne(id: string): Promise<Education> {
    const item = await this.educationModel.findByPk(id);

    if (!item) {
      throw new NotFoundException('Education not found');
    }

    return item;
  }
}
