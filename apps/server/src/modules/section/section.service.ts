import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { Section } from './entities/section.entity';

@Injectable()
export class SectionService {
    constructor(
        @InjectModel(Section) private readonly sectionModel: typeof Section,
        private readonly sequelize: Sequelize,
    ) {}

    getSections(): Promise<Section[]> {
        return this.sectionModel.findAll({ order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
    }

    async reorder(dto: ReorderSectionsDto): Promise<Section[]> {
        await this.sequelize.transaction(async (transaction) => {
            await Promise.all(
                dto.items.map((item) => this.sectionModel.update({ sortOrder: item.sortOrder }, { where: { id: item.id }, transaction })),
            );
        });

        return this.getSections();
    }
}
