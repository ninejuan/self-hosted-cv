import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CvTemplate } from './entities/cv-template.entity';
import {
  AdminTemplateController,
  PublicTemplateController,
} from './template.controller';
import { TemplateService } from './template.service';

@Module({
  imports: [SequelizeModule.forFeature([CvTemplate])],
  controllers: [PublicTemplateController, AdminTemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
