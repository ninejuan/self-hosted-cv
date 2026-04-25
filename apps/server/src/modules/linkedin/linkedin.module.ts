import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';

import { LinkedinController } from './linkedin.controller';
import { LinkedinService } from './linkedin.service';

@Module({ imports: [SequelizeModule.forFeature([Profile, WorkExperience, Education])], controllers: [LinkedinController], providers: [LinkedinService] })
export class LinkedinModule {}
