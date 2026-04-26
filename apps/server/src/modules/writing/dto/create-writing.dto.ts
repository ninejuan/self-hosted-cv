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

export class CreateWritingDto {
  @IsUUID()
  sectionId!: string;

  @IsUUID()
  profileId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  url?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  collaborators?: string | null;

  @IsUrl({ require_protocol: true })
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
