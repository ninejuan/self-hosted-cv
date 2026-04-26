import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'node:crypto';

import { MediaStatus } from '@/database/enums';
import { MinioService } from '@/modules/minio/minio.service';
import { Profile } from '@/modules/profile/entities/profile.entity';

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
    @InjectModel(Profile) private readonly profileModel: typeof Profile,
    private readonly minioService: MinioService,
  ) {}

  async presign(
    dto: PresignMediaDto,
  ): Promise<{ upload_url: string; key: string; file_url: string }> {
    const extension = ALLOWED_MIME_EXTENSIONS[dto.content_type];

    if (!extension) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${Object.keys(ALLOWED_MIME_EXTENSIONS).join(', ')}`,
      );
    }

    const profile = await this.profileModel.findOne({
      order: [['createdAt', 'ASC']],
    });
    const profileId = profile?.id ?? 'default';
    const objectKey = `${dto.purpose ?? 'uploads'}/${profileId}/${randomUUID()}.${extension}`;

    await this.mediaModel.create({
      profileId: profile?.id ?? null,
      entityType: dto.purpose ?? 'upload',
      entityId: null,
      storageKey: objectKey,
      bucket: this.minioService.getBucket(),
      publicUrl: null,
      mimeType: dto.content_type,
      sizeBytes: '0',
      width: null,
      height: null,
      altText: null,
      sortOrder: 0,
      status: MediaStatus.Pending,
    });

    const uploadUrl = await this.minioService.generatePresignedPutUrl(
      objectKey,
      dto.content_type,
      PRESIGNED_URL_EXPIRES_SECONDS,
    );

    const fileUrl = this.minioService.getPublicUrl(objectKey);

    return { upload_url: uploadUrl, key: objectKey, file_url: fileUrl };
  }

  async confirm(dto: ConfirmMediaDto): Promise<Media> {
    const media = await this.mediaModel.findOne({
      where: { storageKey: dto.key },
    });

    if (!media) {
      throw new NotFoundException('Media not found for key');
    }

    const exists = await this.minioService.objectExists(media.storageKey);

    if (!exists) {
      throw new BadRequestException(
        'Uploaded object does not exist in storage',
      );
    }

    media.status = MediaStatus.Attached;
    media.publicUrl = this.minioService.getPublicUrl(media.storageKey);
    media.altText = dto.altText ?? media.altText;
    await media.save();

    return media;
  }

  async delete(
    id: string,
  ): Promise<{ id: string; status: MediaStatus.Deleted }> {
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
