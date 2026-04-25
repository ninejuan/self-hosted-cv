import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SocialLink } from '@/modules/contact/entities/social-link.entity';
import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { Writing } from '@/modules/writing/entities/writing.entity';

import { CvController } from './cv.controller';
import { CvService } from './cv.service';

@Module({
    imports: [SequelizeModule.forFeature([Profile, Section, WorkExperience, Writing, Speaking, SideProject, Education, SocialLink])],
    controllers: [CvController],
    providers: [CvService],
})
export class CvModule {}
