import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWritingDto {
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsUUID()
  @IsOptional()
  profileId?: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
  @IsOptional()
  @MaxLength(2048)
  url?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  collaborators?: string | null;

  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
  @IsOptional()
  @MaxLength(2048)
  thumbnailUrl?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  readTime?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsDateString()
  @IsOptional()
  publishedDate?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
