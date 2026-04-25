import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ConfirmMediaDto {
    @IsUUID()
    mediaId!: string;

    @IsString()
    @IsOptional()
    @MaxLength(512)
    altText?: string;
}
