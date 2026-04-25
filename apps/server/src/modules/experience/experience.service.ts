import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { ReorderDto } from './dto/reorder.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { WorkExperience } from './entities/work-experience.entity';

@Injectable()
export class ExperienceService {
    constructor(
        @InjectModel(WorkExperience) private readonly experienceModel: typeof WorkExperience,
        private readonly sequelize: Sequelize,
    ) {}

    findAll(): Promise<WorkExperience[]> {
        return this.experienceModel.findAll({ order: [['sortOrder', 'ASC'], ['startDate', 'DESC']] });
    }

    create(dto: CreateExperienceDto): Promise<WorkExperience> {
        return this.experienceModel.create({ ...dto, sortOrder: dto.sortOrder ?? 0, visible: dto.visible ?? true });
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
            await Promise.all(dto.items.map((item) => this.experienceModel.update({ sortOrder: item.sortOrder }, { where: { id: item.id }, transaction })));
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
