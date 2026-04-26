import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Education } from './entities/education.entity';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  imports: [SequelizeModule.forFeature([Education])],
  controllers: [EducationController],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
