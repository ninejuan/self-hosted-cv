import { Injectable, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';

import { CvService } from '@/modules/cv/cv.service';
import { MinioService } from '@/modules/minio/minio.service';
import { SettingsService } from '@/modules/settings/settings.service';

import type { ExportCvData, ExportImage, ExportProfile } from './html-renderer';
import { renderStaticSite } from './html-renderer';

type JsonRecord = Record<string, unknown>;

interface RawMedia {
  url?: string;
  alt?: string;
}

const FALLBACK_TEMPLATE_KEY = 'readcv';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly cvService: CvService,
    private readonly settingsService: SettingsService,
    private readonly minioService: MinioService,
  ) {}

  async buildZip(canonicalUrl?: string): Promise<Buffer | null> {
    const cv = await this.cvService.getCv();

    if (!cv || !cv.profile) {
      return null;
    }

    const site = await this.settingsService.getSiteSettings();
    const zip = new AdmZip();

    const assetMap = new Map<string, string>();
    const cvData = this.mapCvData(cv, assetMap);

    const faviconHref = site.faviconUrl
      ? await this.bundleAsset(site.faviconUrl, assetMap, zip)
      : undefined;
    const ogImageHref = site.ogImageUrl
      ? await this.bundleAsset(site.ogImageUrl, assetMap, zip)
      : undefined;

    await this.bundleReferencedAssets(cvData, assetMap, zip);

    const html = renderStaticSite({
      cv: cvData,
      site,
      faviconHref,
      ogImageHref,
      canonicalUrl,
    });

    zip.addFile('index.html', Buffer.from(html, 'utf8'));
    zip.addFile(
      'robots.txt',
      Buffer.from(this.buildRobots(canonicalUrl), 'utf8'),
    );
    zip.addFile(
      'sitemap.xml',
      Buffer.from(this.buildSitemap(canonicalUrl), 'utf8'),
    );

    return zip.toBuffer();
  }

  private mapCvData(
    cv: { profile: JsonRecord | object; sections: unknown[] },
    assetMap: Map<string, string>,
  ): ExportCvData {
    const profileRecord = cv.profile as JsonRecord;
    const templateRecord = this.asRecord(profileRecord.cvTemplate);
    const templateKey =
      this.asString(templateRecord?.key) ?? FALLBACK_TEMPLATE_KEY;

    const sections = Array.isArray(cv.sections) ? cv.sections : [];
    const itemsByType = new Map<string, JsonRecord[]>();
    for (const entry of sections) {
      const record = this.asRecord(entry);
      const section = this.asRecord(record?.section);
      const type = this.asString(section?.type);
      const items = Array.isArray(record?.items)
        ? (record?.items as JsonRecord[])
        : [];
      if (type) itemsByType.set(type, items);
    }

    const profile: ExportProfile = {
      name: this.asString(profileRecord.name) ?? '',
      profession: this.asString(profileRecord.profession) ?? '',
      location: this.asString(profileRecord.location),
      bio: this.asString(profileRecord.bio),
      avatarUrl: this.registerAsset(
        this.asString(profileRecord.avatarUrl),
        assetMap,
      ),
      websiteUrl: this.asString(profileRecord.website),
      templateKey,
      socialLinks: (itemsByType.get('contact') ?? []).map((item) => ({
        platform: this.asString(item.platform) ?? '',
        url: this.asString(item.url) ?? '',
        username: this.asString(item.username) ?? '',
      })),
    };

    return {
      profile,
      experience: (itemsByType.get('work_experience') ?? []).map((item) => ({
        role: this.asString(item.role) ?? '',
        company: this.asString(item.company),
        companyUrl: this.asString(item.url),
        location: this.asString(item.location),
        startDate: this.asString(item.startDate) ?? '',
        endDate: this.asString(item.endDate),
        description: this.asString(item.description),
        media: this.mapMedia(item.media, assetMap),
      })),
      writing: (itemsByType.get('writing') ?? []).map((item) => {
        const thumbnailUrl = this.registerAsset(
          this.asString(item.thumbnailUrl),
          assetMap,
        );
        return {
          title: this.asString(item.title) ?? '',
          url: this.asString(item.url),
          date: this.asString(item.publishedDate) ?? '',
          collaborators: this.asString(item.collaborators),
          description: this.asString(item.description),
          readTime: this.asString(item.readTime),
          thumbnail: thumbnailUrl
            ? { url: thumbnailUrl, alt: this.asString(item.title) }
            : undefined,
        };
      }),
      speaking: (itemsByType.get('speaking') ?? []).map((item) => ({
        title: this.asString(item.title) ?? '',
        url: this.asString(item.url),
        event: this.asString(item.event),
        location: this.asString(item.location),
        date: this.asString(item.date) ?? '',
        media: this.mapMedia(item.media, assetMap),
      })),
      projects: (itemsByType.get('side_project') ?? []).map((item) => ({
        name: this.asString(item.name) ?? '',
        url: this.asString(item.url),
        description: this.asString(item.description),
        startDate: this.asString(item.date) ?? '',
        endDate: undefined,
        media: this.mapMedia(item.media, assetMap),
      })),
      education: (itemsByType.get('education') ?? []).map((item) => ({
        degree: this.asString(item.degree) ?? '',
        institution: this.asString(item.institution) ?? '',
        institutionUrl: this.asString(item.url),
        location: this.asString(item.location),
        startDate: this.asString(item.startDate) ?? '',
        endDate: this.asString(item.endDate),
      })),
    };
  }

  private mapMedia(
    value: unknown,
    assetMap: Map<string, string>,
  ): ExportImage[] {
    if (!Array.isArray(value)) return [];
    const images: ExportImage[] = [];
    for (const entry of value) {
      const media = entry as RawMedia;
      const url = this.registerAsset(media.url, assetMap);
      if (url) images.push({ url, alt: media.alt });
    }
    return images;
  }

  private registerAsset(
    url: string | undefined,
    assetMap: Map<string, string>,
  ): string | undefined {
    if (!url) return undefined;

    const existing = assetMap.get(url);
    if (existing) return existing;

    const storageKey = this.toStorageKey(url);
    if (!storageKey) {
      return url;
    }

    const index = assetMap.size;
    const extension = storageKey.split('.').pop() ?? 'img';
    const localPath = `assets/${index}-${this.basename(storageKey)}.${extension}`;
    assetMap.set(url, localPath);
    return localPath;
  }

  private async bundleReferencedAssets(
    cvData: ExportCvData,
    assetMap: Map<string, string>,
    zip: AdmZip,
  ): Promise<void> {
    for (const [originalUrl, localPath] of assetMap.entries()) {
      if (!localPath.startsWith('assets/')) continue;
      await this.downloadInto(originalUrl, localPath, zip);
    }
    void cvData;
  }

  private async bundleAsset(
    url: string,
    assetMap: Map<string, string>,
    zip: AdmZip,
  ): Promise<string | undefined> {
    const localPath = this.registerAsset(url, assetMap);
    if (!localPath || !localPath.startsWith('assets/')) {
      return localPath;
    }
    await this.downloadInto(url, localPath, zip);
    return localPath;
  }

  private async downloadInto(
    url: string,
    localPath: string,
    zip: AdmZip,
  ): Promise<void> {
    const storageKey = this.toStorageKey(url);
    if (!storageKey) return;

    try {
      const buffer = await this.minioService.getObject(storageKey);
      zip.addFile(localPath, buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Failed to bundle asset ${storageKey}: ${message}`,
        ExportService.name,
      );
    }
  }

  private toStorageKey(url: string): string | null {
    const publicUrl = this.minioService.getPublicUrl('');
    const prefix = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;

    if (url.startsWith(prefix)) {
      return url.slice(prefix.length);
    }

    return null;
  }

  private basename(storageKey: string): string {
    const last = storageKey.split('/').pop() ?? storageKey;
    return last.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'img';
  }

  private buildRobots(canonicalUrl?: string): string {
    const lines = ['User-agent: *', 'Allow: /'];
    if (canonicalUrl) {
      lines.push(`Sitemap: ${this.joinUrl(canonicalUrl, 'sitemap.xml')}`);
    }
    return `${lines.join('\n')}\n`;
  }

  private buildSitemap(canonicalUrl?: string): string {
    const loc = canonicalUrl ?? '';
    const lastmod = new Date().toISOString().slice(0, 10);
    const urlEntry = loc
      ? `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n`
      : '';
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntry}</urlset>\n`;
  }

  private joinUrl(base: string, path: string): string {
    return base.endsWith('/') ? `${base}${path}` : `${base}/${path}`;
  }

  private asRecord(value: unknown): JsonRecord | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as JsonRecord)
      : undefined;
  }

  private asString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
}
