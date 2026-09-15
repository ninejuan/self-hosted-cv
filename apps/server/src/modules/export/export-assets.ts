import { PayloadTooLargeException } from '@nestjs/common';
import AdmZip from 'adm-zip';

import { MinioService } from '@/modules/minio/minio.service';

export type ExportSizeLimits = {
  readonly maxObjects: number;
  readonly maxObjectBytes: number;
  readonly maxTotalBytes: number;
};

type Asset = {
  readonly localPath: string;
  readonly storageKey: string;
};

export class ExportAssets {
  private readonly assetsByUrl = new Map<string, Asset>();

  constructor(private readonly minioService: MinioService) {}

  register(url: string | undefined): string | undefined {
    if (!url) return undefined;

    const existing = this.assetsByUrl.get(url);
    if (existing) return existing.localPath;

    const storageKey = this.toStorageKey(url);
    if (!storageKey) return url;

    const extension = storageKey.split('.').pop() ?? 'img';
    const basename = this.basename(storageKey);
    const localPath = `assets/${this.assetsByUrl.size}-${basename}.${extension}`;
    this.assetsByUrl.set(url, { localPath, storageKey });
    return localPath;
  }

  async assertWithin(limits: ExportSizeLimits): Promise<void> {
    const assets = [...this.assetsByUrl.values()];
    if (assets.length > limits.maxObjects) {
      throw new PayloadTooLargeException('Export contains too many objects');
    }

    let totalBytes = 0;
    for (const asset of assets) {
      const size = await this.minioService.statObjectSize(asset.storageKey);
      if (size > limits.maxObjectBytes) {
        throw new PayloadTooLargeException('Export object is too large');
      }

      totalBytes += size;
      if (totalBytes > limits.maxTotalBytes) {
        throw new PayloadTooLargeException('Export is too large');
      }
    }
  }

  async addTo(zip: AdmZip): Promise<void> {
    for (const asset of this.assetsByUrl.values()) {
      const buffer = await this.minioService.getObject(asset.storageKey);
      zip.addFile(asset.localPath, buffer);
    }
  }

  private toStorageKey(url: string): string | null {
    const publicUrl = this.minioService.getPublicUrl('');
    const prefix = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : null;
  }

  private basename(storageKey: string): string {
    const last = storageKey.split('/').pop() ?? storageKey;
    return last.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'img';
  }
}
