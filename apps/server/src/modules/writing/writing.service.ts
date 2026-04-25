import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CreateWritingDto } from './dto/create-writing.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateWritingDto } from './dto/update-writing.dto';
import { Writing } from './entities/writing.entity';

@Injectable()
export class WritingService {
    constructor(
        @InjectModel(Writing) private readonly writingModel: typeof Writing,
        private readonly sequelize: Sequelize,
    ) {}

    findAll(): Promise<Writing[]> {
        return this.writingModel.findAll({ order: [['sortOrder', 'ASC'], ['publishedDate', 'DESC']] });
    }

    create(dto: CreateWritingDto): Promise<Writing> {
        return this.writingModel.create({ ...dto, sortOrder: dto.sortOrder ?? 0, visible: dto.visible ?? true });
    }

    async update(id: string, dto: UpdateWritingDto): Promise<Writing> {
        const item = await this.findOne(id);

        await item.update(dto);

        return item;
    }

    async delete(id: string): Promise<{ id: string }> {
        const item = await this.findOne(id);

        await item.destroy();

        return { id };
    }

    async reorder(dto: ReorderDto): Promise<Writing[]> {
        await this.sequelize.transaction(async (transaction) => {
            await Promise.all(dto.items.map((item) => this.writingModel.update({ sortOrder: item.sortOrder }, { where: { id: item.id }, transaction })));
        });

        return this.findAll();
    }

    private async findOne(id: string): Promise<Writing> {
        const item = await this.writingModel.findByPk(id);

        if (!item) {
            throw new NotFoundException('Writing not found');
        }

        return item;
    }
}
