import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CvTemplate } from '@/modules/template/entities/cv-template.entity';

import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [SequelizeModule.forFeature([Profile, CvTemplate])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
