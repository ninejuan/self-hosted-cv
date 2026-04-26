import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';

import { Education } from './entities/education.entity';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  imports: [SequelizeModule.forFeature([Education, Profile, Section])],
  controllers: [EducationController],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
