import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { WorkExperience } from './entities/work-experience.entity';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';

@Module({
  imports: [SequelizeModule.forFeature([WorkExperience])],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
