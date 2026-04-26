import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CreateEducationDto } from './dto/create-education.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Education } from './entities/education.entity';

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education) private readonly educationModel: typeof Education,
    private readonly sequelize: Sequelize,
  ) {}

  findAll(): Promise<Education[]> {
    return this.educationModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['startDate', 'DESC'],
      ],
    });
  }

  create(dto: CreateEducationDto): Promise<Education> {
    return this.educationModel.create({
      ...dto,
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
