import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SocialLink } from './entities/social-link.entity';

@Module({ imports: [SequelizeModule.forFeature([SocialLink])], controllers: [ContactController], providers: [ContactService], exports: [ContactService] })
export class ContactModule {}
