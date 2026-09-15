import type { SiteSettings } from '@/modules/settings/settings.service';

import {
  EXPORT_ARROW_SVG,
  EXPORT_BASE_CSS,
  EXPORT_FONT_LINKS,
  EXPORT_PRINTER_SVG,
  EXPORT_SUN_SVG,
  EXPORT_THEME_SCRIPT,
  EXPORT_TOOLBAR_SCRIPT,
} from './export-styles.constants';

export interface ExportImage {
  url: string;
  alt?: string;
}

export interface ExportProfile {
  name: string;
  profession: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  templateKey: string;
  socialLinks: Array<{ platform: string; url: string; username: string }>;
}

export interface ExportExperience {
  role: string;
  company?: string;
  companyUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  media: ExportImage[];
}

export interface ExportWriting {
  title: string;
  url?: string;
  date: string;
  collaborators?: string;
  description?: string;
  readTime?: string;
  thumbnail?: ExportImage;
}

export interface ExportSpeaking {
  title: string;
  url?: string;
  event?: string;
  location?: string;
  date: string;
  media: ExportImage[];
}

export interface ExportProject {
  name: string;
  url?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  media: ExportImage[];
}

export interface ExportEducation {
  degree: string;
  institution: string;
  institutionUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}

export interface ExportCvData {
  profile: ExportProfile;
  experience: ExportExperience[];
  writing: ExportWriting[];
  speaking: ExportSpeaking[];
  projects: ExportProject[];
  education: ExportEducation[];
}

export interface RenderOptions {
  cv: ExportCvData;
  site: SiteSettings;
  faviconHref?: string;
  ogImageHref?: string;
  canonicalUrl?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.split('-')[0] ?? dateStr;
}

function formatDateRange(start: string, end?: string): string {
  const s = formatDate(start);
  if (!end) return `${s} — Now`;
  return `${s} — ${formatDate(end)}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function externalLink(href: string, label: string): string {
  return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" class="cv-item-link">${escapeHtml(
    label,
  )}<span class="cv-link-arrow">${EXPORT_ARROW_SVG}</span></a>`;
}

function renderImages(images: ExportImage[], fallbackAlt: string): string {
  if (images.length === 0) return '';
  const items = images
    .map(
      (image) =>
        `<div class="cv-item-image-wrapper"><img src="${escapeAttr(image.url)}" alt="${escapeAttr(
          image.alt ?? fallbackAlt,
        )}" /></div>`,
    )
    .join('');
  return `<div class="cv-item-images">${items}</div>`;
}

function renderHeader(profile: ExportProfile): string {
  const hasPhoto = Boolean(profile.avatarUrl);
  const photo = hasPhoto
    ? `<img src="${escapeAttr(profile.avatarUrl as string)}" alt="${escapeAttr(
        profile.name,
      )}" class="cv-header-photo" />`
    : '';
  const subtitle = `${escapeHtml(profile.profession)}${
    profile.location ? ` in ${escapeHtml(profile.location)}` : ''
  }`;
  const tag = profile.websiteUrl
    ? `<a href="${escapeAttr(profile.websiteUrl)}" target="_blank" rel="noopener noreferrer" class="cv-header-tag">${escapeHtml(
        profile.websiteUrl.replace(/^https?:\/\//, ''),
      )}</a>`
    : '';

  return `<header class="cv-header ${hasPhoto ? '' : 'cv-header-no-photo'}">
    ${photo}
    <div class="cv-header-text">
        <h1 class="cv-header-name">${escapeHtml(profile.name)}</h1>
        <p class="cv-header-subtitle">${subtitle}</p>
    </div>
    ${tag}
</header>`;
}

function renderAbout(bio?: string): string {
  if (!bio) return '';
  return `<section class="cv-section cv-section-about">
    <h2 class="cv-section-title">About</h2>
    <p class="cv-about-text">${escapeHtml(bio)}</p>
</section>`;
}

function itemRow(date: string, content: string): string {
  return `<div class="cv-item-row">
        <div class="cv-date-column">${escapeHtml(date)}</div>
        <div class="cv-content-column">${content}</div>
    </div>`;
}

function sectionLayout(title: string, rows: string[]): string {
  if (rows.length === 0) return '';
  return `<section class="cv-section cv-section-items-wrapper">
    <h2 class="cv-section-title">${escapeHtml(title)}</h2>
    <div class="cv-section-items">${rows.join('')}</div>
</section>`;
}

function renderExperience(items: ExportExperience[]): string {
  const rows = items.map((item) => {
    const label = item.company ? `${item.role} at ${item.company}` : item.role;
    const title =
      item.companyUrl && item.company
        ? externalLink(item.companyUrl, label)
        : `<span class="cv-item-title">${escapeHtml(label)}</span>`;
    const location = item.location
      ? `<span class="cv-item-subtitle">${escapeHtml(item.location)}</span>`
      : '';
    const description = item.description
      ? `<span class="cv-item-subtitle">${escapeHtml(item.description)}</span>`
      : '';
    const media = renderImages(item.media, item.company ?? item.role);
    return itemRow(
      formatDateRange(item.startDate, item.endDate),
      `${title}${location}${description}${media}`,
    );
  });
  return sectionLayout('Work Experience', rows);
}

function renderWriting(items: ExportWriting[]): string {
  const rows = items.map((item) => {
    const title = item.url
      ? externalLink(item.url, item.title)
      : `<span class="cv-item-title">${escapeHtml(item.title)}</span>`;
    const collaborators = item.collaborators
      ? `<span class="cv-item-subtitle">${escapeHtml(item.collaborators)}</span>`
      : '';
    let card = '';
    if (item.thumbnail || item.description) {
      const image = item.thumbnail
        ? `<div class="cv-writing-card-image"><img src="${escapeAttr(
            item.thumbnail.url,
          )}" alt="${escapeAttr(item.thumbnail.alt ?? item.title)}" /></div>`
        : '';
      const body = item.description
        ? `<div class="cv-writing-card-body"><span class="cv-item-subtitle">${escapeHtml(
            item.description,
          )}</span>${
            item.readTime
              ? `<span class="cv-item-subtitle" style="color: var(--color-text-muted); font-size: 12px;">${escapeHtml(
                  item.readTime,
                )}</span>`
              : ''
          }</div>`
        : '';
      card = `<div class="cv-writing-card"><div class="cv-writing-card-inner">${image}${body}</div></div>`;
    }
    return itemRow(formatDate(item.date), `${title}${collaborators}${card}`);
  });
  return sectionLayout('Writing', rows);
}

function renderSpeaking(items: ExportSpeaking[]): string {
  const rows = items.map((item) => {
    const title = item.url
      ? externalLink(item.url, item.title)
      : `<span class="cv-item-title">${escapeHtml(item.title)}</span>`;
    const event = item.event
      ? `<span class="cv-item-subtitle">${escapeHtml(item.event)}</span>`
      : '';
    const location = item.location
      ? `<span class="cv-item-subtitle">${escapeHtml(item.location)}</span>`
      : '';
    const media = renderImages(item.media, item.title);
    return itemRow(
      formatDate(item.date),
      `${title}${event}${location}${media}`,
    );
  });
  return sectionLayout('Speaking', rows);
}

function renderProjects(items: ExportProject[]): string {
  const rows = items.map((item) => {
    const title = item.url
      ? externalLink(item.url, item.name)
      : `<span class="cv-item-title">${escapeHtml(item.name)}</span>`;
    const description = item.description
      ? `<span class="cv-item-subtitle">${escapeHtml(item.description)}</span>`
      : '';
    const media = renderImages(item.media, item.name);
    return itemRow(
      formatDateRange(item.startDate, item.endDate),
      `${title}${description}${media}`,
    );
  });
  return sectionLayout('Side Projects', rows);
}

function renderEducation(items: ExportEducation[]): string {
  const rows = items.map((item) => {
    const label = `${item.degree} at ${item.institution}`;
    const title = item.institutionUrl
      ? externalLink(item.institutionUrl, label)
      : `<span class="cv-item-title">${escapeHtml(label)}</span>`;
    const location = item.location
      ? `<span class="cv-item-subtitle">${escapeHtml(item.location)}</span>`
      : '';
    return itemRow(
      formatDateRange(item.startDate, item.endDate),
      `${title}${location}`,
    );
  });
  return sectionLayout('Education', rows);
}

function renderContact(links: ExportProfile['socialLinks']): string {
  const rows = links.map((link) =>
    itemRow(capitalize(link.platform), externalLink(link.url, link.username)),
  );
  return sectionLayout('Contact', rows);
}

function buildJsonLd(profile: ExportProfile): string {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.profession,
  };
  if (profile.location) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
    };
  }
  if (profile.bio) jsonLd.description = profile.bio;
  if (profile.avatarUrl) jsonLd.image = profile.avatarUrl;
  if (profile.websiteUrl) jsonLd.url = profile.websiteUrl;
  jsonLd.sameAs = profile.socialLinks.map((link) => link.url);

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

function buildHead(options: RenderOptions): string {
  const { cv, site, faviconHref, ogImageHref, canonicalUrl } = options;
  const { profile } = cv;

  const title = profile.name
    ? `${profile.name} — ${profile.profession}`
    : site.siteTitle || 'Self-Hosted CV';
  const description = profile.bio
    ? truncate(profile.bio, 160)
    : site.siteDescription || 'Self-hosted CV/portfolio platform';
  const ogTitle = site.ogTitle || title;
  const ogDescription = site.ogDescription || description;
  const themeColor = site.themeColor || '#A8E765';
  const ogImage = ogImageHref ?? site.ogImageUrl;

  const tags: string[] = [
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<meta name="theme-color" content="${escapeAttr(themeColor)}" />`,
    canonicalUrl
      ? `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
      : '',
    faviconHref ? `<link rel="icon" href="${escapeAttr(faviconHref)}" />` : '',
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${escapeAttr(ogTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(ogDescription)}" />`,
    ogImage
      ? `<meta property="og:image" content="${escapeAttr(ogImage)}" />`
      : '',
    canonicalUrl
      ? `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
      : '',
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    ogImage
      ? `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`
      : '',
    EXPORT_FONT_LINKS,
    buildJsonLd(profile),
    `<style>${EXPORT_BASE_CSS}</style>`,
    site.customCss ? `<style>${site.customCss}</style>` : '',
    site.googleAnalyticsId
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(
          site.googleAnalyticsId,
        )}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeAttr(
          site.googleAnalyticsId,
        )}');</script>`
      : '',
    `<script>${EXPORT_THEME_SCRIPT}</script>`,
  ];

  return tags.filter(Boolean).join('\n    ');
}

export function renderStaticSite(options: RenderOptions): string {
  const { cv } = options;
  const { profile } = cv;
  const templateClass = `cv-template-${profile.templateKey}`;

  const body = `<main class="cv-page ${templateClass}" data-cv-template="${escapeAttr(
    profile.templateKey,
  )}">
    <div class="cv-toolbar">
        <button type="button" id="theme-toggle" class="cv-toolbar-btn" aria-label="Toggle theme" title="Toggle theme">${EXPORT_SUN_SVG}</button>
        <button type="button" id="print-button" class="cv-toolbar-btn" aria-label="Save as PDF" title="Save as PDF">${EXPORT_PRINTER_SVG}</button>
    </div>
    ${renderHeader(profile)}
    <div class="cv-main">
        ${renderAbout(profile.bio)}
        ${renderExperience(cv.experience)}
        ${renderWriting(cv.writing)}
        ${renderSpeaking(cv.speaking)}
        ${renderProjects(cv.projects)}
        ${renderEducation(cv.education)}
        ${renderContact(profile.socialLinks)}
    </div>
</main>`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    ${buildHead(options)}
</head>
<body>
    ${body}
    <script>${EXPORT_TOOLBAR_SCRIPT}</script>
</body>
</html>`;
}
