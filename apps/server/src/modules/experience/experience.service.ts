import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { SectionType } from '@/database/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { Inject } from '@nestjs/common';

import { ReorderDto } from './dto/reorder.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { WorkExperience } from './entities/work-experience.entity';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectModel(WorkExperience)
    private readonly experienceModel: typeof WorkExperience,
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
        where: { profileId, type: SectionType.WorkExperience },
      });
      if (section) {
        sectionId = section.id;
      } else {
        const created = await this.sectionModel.create({
          profileId,
          type: 'work_experience' as SectionType,
          title: 'Work Experience',
          sortOrder: 0,
          visible: true,
        });
        sectionId = created.id;
      }
    }

    return { profileId, sectionId };
  }

  findAll(): Promise<WorkExperience[]> {
    return this.experienceModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['startDate', 'DESC'],
      ],
    });
  }

  async create(dto: CreateExperienceDto): Promise<WorkExperience> {
    const { profileId, sectionId } = await this.resolveIds(dto);

    return this.experienceModel.create({
      ...dto,
      profileId,
      sectionId,
      sortOrder: dto.sortOrder ?? 0,
      visible: dto.visible ?? true,
    });
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<WorkExperience> {
    const item = await this.findOne(id);

    await item.update(dto);

    return item;
  }

  async delete(id: string): Promise<{ id: string }> {
    const item = await this.findOne(id);

    await item.destroy();

    return { id };
  }

  async reorder(dto: ReorderDto): Promise<WorkExperience[]> {
    await this.sequelize.transaction(async (transaction) => {
      await Promise.all(
        dto.items.map((item) =>
          this.experienceModel.update(
            { sortOrder: item.sortOrder },
            { where: { id: item.id }, transaction },
          ),
        ),
      );
    });

    return this.findAll();
  }

  private async findOne(id: string): Promise<WorkExperience> {
    const item = await this.experienceModel.findByPk(id);

    if (!item) {
      throw new NotFoundException('Experience not found');
    }

    return item;
  }
}
