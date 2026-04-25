import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'node:crypto';

import { MediaStatus } from '@/database/enums';
import { MinioService } from '@/modules/minio/minio.service';

import { ConfirmMediaDto } from './dto/confirm-media.dto';
import { PresignMediaDto } from './dto/presign-media.dto';
import { Media } from './entities/media.entity';

const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

const PRESIGNED_URL_EXPIRES_SECONDS = 900;

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media) private readonly mediaModel: typeof Media,
        private readonly minioService: MinioService,
    ) {}

    async presign(dto: PresignMediaDto): Promise<{ uploadUrl: string; objectKey: string; media: Media }> {
        const extension = ALLOWED_MIME_EXTENSIONS[dto.mimeType];

        if (!extension) {
            throw new BadRequestException('Unsupported media MIME type');
        }

        const objectKey = `profiles/${dto.profileId}/${randomUUID()}.${extension}`;
        const media = await this.mediaModel.create({
            profileId: dto.profileId,
            entityType: dto.entityType,
            entityId: dto.entityId,
            storageKey: objectKey,
            bucket: this.minioService.getBucket(),
            publicUrl: null,
            mimeType: dto.mimeType,
            sizeBytes: String(dto.sizeBytes),
            width: null,
            height: null,
            altText: null,
            sortOrder: 0,
            status: MediaStatus.Pending,
        });
        const uploadUrl = await this.minioService.generatePresignedPutUrl(objectKey, dto.mimeType, PRESIGNED_URL_EXPIRES_SECONDS);

        return { uploadUrl, objectKey, media };
    }

    async confirm(dto: ConfirmMediaDto): Promise<Media> {
        const media = await this.findMedia(dto.mediaId);
        const exists = await this.minioService.objectExists(media.storageKey);

        if (!exists) {
            throw new BadRequestException('Uploaded object does not exist');
        }

        media.status = MediaStatus.Attached;
        media.altText = dto.altText ?? media.altText;
        await media.save();

        return media;
    }

    async delete(id: string): Promise<{ id: string; status: MediaStatus.Deleted }> {
        const media = await this.findMedia(id);

        await this.minioService.deleteObject(media.storageKey);
        media.status = MediaStatus.Deleted;
        await media.save();
        await media.destroy();

        return { id, status: MediaStatus.Deleted };
    }

    private async findMedia(id: string): Promise<Media> {
        const media = await this.mediaModel.findByPk(id);

        if (!media) {
            throw new NotFoundException('Media not found');
        }

        return media;
    }
}
