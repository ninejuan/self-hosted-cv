import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CreateSpeakingDto } from './dto/create-speaking.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateSpeakingDto } from './dto/update-speaking.dto';
import { Speaking } from './entities/speaking.entity';

@Injectable()
export class SpeakingService {
    constructor(
        @InjectModel(Speaking) private readonly speakingModel: typeof Speaking,
        private readonly sequelize: Sequelize,
    ) {}

    findAll(): Promise<Speaking[]> {
        return this.speakingModel.findAll({ order: [['sortOrder', 'ASC'], ['date', 'DESC']] });
    }

    create(dto: CreateSpeakingDto): Promise<Speaking> {
        return this.speakingModel.create({ ...dto, sortOrder: dto.sortOrder ?? 0, visible: dto.visible ?? true });
    }

    async update(id: string, dto: UpdateSpeakingDto): Promise<Speaking> {
        const item = await this.findOne(id);

        await item.update(dto);

        return item;
    }

    async delete(id: string): Promise<{ id: string }> {
        const item = await this.findOne(id);

        await item.destroy();

        return { id };
    }

    async reorder(dto: ReorderDto): Promise<Speaking[]> {
        await this.sequelize.transaction(async (transaction) => {
            await Promise.all(dto.items.map((item) => this.speakingModel.update({ sortOrder: item.sortOrder }, { where: { id: item.id }, transaction })));
        });

        return this.findAll();
    }

    private async findOne(id: string): Promise<Speaking> {
        const item = await this.speakingModel.findByPk(id);

        if (!item) {
            throw new NotFoundException('Speaking not found');
        }

        return item;
    }
}
