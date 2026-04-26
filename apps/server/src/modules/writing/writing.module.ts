import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';

import { Writing } from './entities/writing.entity';
import { WritingController } from './writing.controller';
import { WritingService } from './writing.service';

@Module({
  imports: [SequelizeModule.forFeature([Writing, Profile, Section])],
  controllers: [WritingController],
  providers: [WritingService],
  exports: [WritingService],
})
export class WritingModule {}
