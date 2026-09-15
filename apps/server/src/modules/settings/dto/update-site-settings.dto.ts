import { IsOptional, IsString, Matches } from 'class-validator';

export const GOOGLE_ANALYTICS_ID_PATTERN = /^(?:G-[A-Z0-9]{4,20})?$/;

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  siteTitle?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  themeColor?: string;

  @IsOptional()
  @IsString()
  @Matches(GOOGLE_ANALYTICS_ID_PATTERN, {
    message: 'googleAnalyticsId must be empty or a valid GA measurement ID',
  })
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  customCss?: string;
}
