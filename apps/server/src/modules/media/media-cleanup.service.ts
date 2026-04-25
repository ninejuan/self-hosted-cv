import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';

import { MediaStatus } from '@/database/enums';
import { LoggerService } from '@/logger/logger.service';
import { MinioService } from '@/modules/minio/minio.service';

import { Media } from './entities/media.entity';

const ORPHAN_MEDIA_MAX_AGE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class MediaCleanupService {
    constructor(
        @InjectModel(Media) private readonly mediaModel: typeof Media,
        private readonly minioService: MinioService,
        private readonly logger: LoggerService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupPendingOrphans(): Promise<void> {
        const cutoff = new Date(Date.now() - ORPHAN_MEDIA_MAX_AGE_MS);
        const orphanedMedia = await this.mediaModel.findAll({
            where: {
                status: MediaStatus.Pending,
                createdAt: { [Op.lt]: cutoff },
            },
        });
        let deletedObjects = 0;
        let deletedRecords = 0;

        for (const media of orphanedMedia) {
            try {
                await this.minioService.deleteObject(media.storageKey);
                deletedObjects += 1;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown MinIO delete error';

                this.logger.warn(`Failed to delete orphan media object ${media.storageKey}: ${message}`, 'MediaCleanupService');
            }

            await media.destroy();
            deletedRecords += 1;
        }

        this.logger.log(
            `Media orphan cleanup completed: scanned=${orphanedMedia.length} deletedRecords=${deletedRecords} deletedObjects=${deletedObjects}`,
            'MediaCleanupService',
        );
    }
}
