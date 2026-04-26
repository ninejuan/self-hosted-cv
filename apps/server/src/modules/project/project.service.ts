import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CreateProjectDto } from './dto/create-project.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SideProject } from './entities/side-project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(SideProject) private readonly projectModel: typeof SideProject,
    private readonly sequelize: Sequelize,
  ) {}

  findAll(): Promise<SideProject[]> {
    return this.projectModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['date', 'DESC'],
      ],
    });
  }

  create(dto: CreateProjectDto): Promise<SideProject> {
    return this.projectModel.create({
      ...dto,
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
