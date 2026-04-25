import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    username!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    password!: string;

    @IsString()
    @IsOptional()
    @Length(6, 6)
    totpCode?: string;
}
