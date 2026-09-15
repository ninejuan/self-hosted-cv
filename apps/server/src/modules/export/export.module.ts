import { Module } from '@nestjs/common';

import { CvModule } from '@/modules/cv/cv.module';
import { MinioModule } from '@/modules/minio/minio.module';
import { SettingsModule } from '@/modules/settings/settings.module';

import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [CvModule, SettingsModule, MinioModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
