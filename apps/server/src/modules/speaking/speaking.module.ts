import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Speaking } from './entities/speaking.entity';
import { SpeakingController } from './speaking.controller';
import { SpeakingService } from './speaking.service';

@Module({ imports: [SequelizeModule.forFeature([Speaking])], controllers: [SpeakingController], providers: [SpeakingService], exports: [SpeakingService] })
export class SpeakingModule {}
