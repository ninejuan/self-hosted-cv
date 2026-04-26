import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SocialLink } from './entities/social-link.entity';

@Module({
  imports: [SequelizeModule.forFeature([SocialLink, Profile, Section])],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
