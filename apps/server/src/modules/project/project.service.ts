import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { SectionType } from '@/database/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { Inject } from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SideProject } from './entities/side-project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(SideProject) private readonly projectModel: typeof SideProject,
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
        where: { profileId, type: SectionType.SideProject },
      });
      if (section) {
        sectionId = section.id;
      } else {
        const created = await this.sectionModel.create({
          profileId,
          type: 'side_project' as SectionType,
          title: 'Side Project',
          sortOrder: 0,
          visible: true,
        });
        sectionId = created.id;
      }
    }

    return { profileId, sectionId };
  }

  findAll(): Promise<SideProject[]> {
    return this.projectModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['date', 'DESC'],
      ],
    });
  }

  async create(dto: CreateProjectDto): Promise<SideProject> {
    const { profileId, sectionId } = await this.resolveIds(dto);

    return this.projectModel.create({
      ...dto,
      profileId,
      sectionId,
      sortOrder: dto.sortOrder ?? 0,
      visible: dto.visible ?? true,
    });
  }

  async update(id: string, dto: UpdateProjectDto): Promise<SideProject> {
    const item = await this.findOne(id);

    await item.update(dto);

    return item;
  }

  async delete(id: string): Promise<{ id: string }> {
    const item = await this.findOne(id);

    await item.destroy();

    return { id };
  }

  async reorder(dto: ReorderDto): Promise<SideProject[]> {
    await this.sequelize.transaction(async (transaction) => {
      await Promise.all(
        dto.items.map((item) =>
          this.projectModel.update(
            { sortOrder: item.sortOrder },
            { where: { id: item.id }, transaction },
          ),
        ),
      );
    });

    return this.findAll();
  }

  private async findOne(id: string): Promise<SideProject> {
    const item = await this.projectModel.findByPk(id);

    if (!item) {
      throw new NotFoundException('Project not found');
    }

    return item;
  }
}
