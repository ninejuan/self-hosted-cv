import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class PresignMediaDto {
  @IsUUID()
  profileId!: string;

  @IsString()
  @IsNotEmpty()
  entityType!: string;

  @IsUUID()
  entityId!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  sizeBytes!: number;
}
