import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SideProject } from './entities/side-project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({ imports: [SequelizeModule.forFeature([SideProject])], controllers: [ProjectController], providers: [ProjectService], exports: [ProjectService] })
export class ProjectModule {}
