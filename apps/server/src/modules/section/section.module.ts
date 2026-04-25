import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Section } from './entities/section.entity';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';

@Module({
    imports: [SequelizeModule.forFeature([Section])],
    controllers: [SectionController],
    providers: [SectionService],
    exports: [SectionService],
})
export class SectionModule {}
