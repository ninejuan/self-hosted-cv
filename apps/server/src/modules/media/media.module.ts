import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { MinioModule } from '@/modules/minio/minio.module';

import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
    imports: [SequelizeModule.forFeature([Media]), MinioModule],
    controllers: [MediaController],
    providers: [MediaService],
})
export class MediaModule {}
