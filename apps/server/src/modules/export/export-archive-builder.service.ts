import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';

import type { CvResponse } from '@/modules/cv/cv.service';
import { MinioService } from '@/modules/minio/minio.service';
import type { SiteSettings } from '@/modules/settings/settings.service';

import { ExportAssets, type ExportSizeLimits } from './export-assets';
import type { ExportCvData, ExportImage, ExportProfile } from './html-renderer';
import { renderStaticSite } from './html-renderer';

type JsonRecord = Record<string, unknown>;
type RawMedia = { readonly url?: string; readonly alt?: string };

const FALLBACK_TEMPLATE_KEY = 'readcv';

@Injectable()
export class ExportArchiveBuilderService {
  constructor(private readonly minioService: MinioService) {}

  async build(
    cv: CvResponse,
    site: SiteSettings,
    limits: ExportSizeLimits,
    canonicalUrl?: string,
  ): Promise<Buffer> {
    const assets = new ExportAssets(this.minioService);
    const cvData = this.mapCvData(cv, assets);
    const faviconHref = assets.register(site.faviconUrl);
    const ogImageHref = assets.register(site.ogImageUrl);

    await assets.assertWithin(limits);

    const zip = new AdmZip();
    await assets.addTo(zip);
    zip.addFile(
      'index.html',
      Buffer.from(
        renderStaticSite({
          cv: cvData,
          site,
          faviconHref,
          ogImageHref,
          canonicalUrl,
        }),
        'utf8',
      ),
    );
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

  private mapCvData(cv: CvResponse, assets: ExportAssets): ExportCvData {
    const profileRecord = cv.profile as JsonRecord;
    const templateRecord = this.asRecord(profileRecord.cvTemplate);
    const templateKey =
      this.asString(templateRecord?.key) ?? FALLBACK_TEMPLATE_KEY;
    const itemsByType = new Map<string, JsonRecord[]>();

    for (const entry of cv.sections) {
      const record = this.asRecord(entry);
      const section = this.asRecord(record?.section);
      const type = this.asString(section?.type);
      const items = Array.isArray(record?.items)
        ? (record.items as JsonRecord[])
        : [];
      if (type) itemsByType.set(type, items);
    }

    const profile: ExportProfile = {
      name: this.asString(profileRecord.name) ?? '',
      profession: this.asString(profileRecord.profession) ?? '',
      location: this.asString(profileRecord.location),
      bio: this.asString(profileRecord.bio),
      avatarUrl: assets.register(this.asString(profileRecord.avatarUrl)),
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
        media: this.mapMedia(item.media, assets),
      })),
      writing: (itemsByType.get('writing') ?? []).map((item) => {
        const thumbnailUrl = assets.register(this.asString(item.thumbnailUrl));
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
        media: this.mapMedia(item.media, assets),
      })),
      projects: (itemsByType.get('side_project') ?? []).map((item) => ({
        name: this.asString(item.name) ?? '',
        url: this.asString(item.url),
        description: this.asString(item.description),
        startDate: this.asString(item.date) ?? '',
        endDate: undefined,
        media: this.mapMedia(item.media, assets),
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

  private mapMedia(value: unknown, assets: ExportAssets): ExportImage[] {
    if (!Array.isArray(value)) return [];
    const images: ExportImage[] = [];
    for (const entry of value) {
      const media = entry as RawMedia;
      const url = assets.register(media.url);
      if (url) images.push({ url, alt: media.alt });
    }
    return images;
  }

  private buildRobots(canonicalUrl?: string): string {
    const lines = ['User-agent: *', 'Allow: /'];
    if (canonicalUrl)
      lines.push(`Sitemap: ${this.joinUrl(canonicalUrl, 'sitemap.xml')}`);
    return `${lines.join('\n')}\n`;
  }

  private buildSitemap(canonicalUrl?: string): string {
    const loc = canonicalUrl ?? '';
    const lastmod = new Date().toISOString().slice(0, 10);
    const entry = loc
      ? `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n`
      : '';
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entry}</urlset>\n`;
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
