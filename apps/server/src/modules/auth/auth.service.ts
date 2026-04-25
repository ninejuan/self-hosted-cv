import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';

import { AuditAction } from '@/database/enums';
import { AuditService } from '@/modules/audit/audit.service';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';

import { LoginDto } from './dto/login.dto';
import { TotpCodeDto } from './dto/totp-code.dto';

const TOTP_SECRET_KEY = 'totp_secret';
const TOTP_ENABLED_KEY = 'totp_enabled';
const TOTP_WINDOW = 1;

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly auditService: AuditService,
        @InjectModel(AppSetting) private readonly settingModel: typeof AppSetting,
    ) {}

    async login(dto: LoginDto, request: Request): Promise<{ isAuthenticated: true; username: string }> {
        const adminUsername = this.configService.getOrThrow<string>('ADMIN_USERNAME');
        const passwordHash = this.configService.getOrThrow<string>('ADMIN_PASSWORD_HASH');
        const isUsernameValid = dto.username === adminUsername;
        const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);

        if (!isUsernameValid || !isPasswordValid) {
            await this.auditService.record({
                action: AuditAction.LoginFailed,
                entityType: 'auth',
                ip: request.ip ?? null,
                userAgent: request.header('user-agent') ?? null,
                sessionId: request.sessionID ?? null,
                newValue: { username: dto.username },
            });
            throw new UnauthorizedException('Invalid username or password');
        }

        if (await this.isTwoFactorEnabled()) {
            const secret = await this.getTotpSecret();

            if (!dto.totpCode || !secret || !this.verifyToken(secret, dto.totpCode)) {
                await this.auditService.record({
                    action: AuditAction.LoginFailed,
                    entityType: 'auth',
                    ip: request.ip ?? null,
                    userAgent: request.header('user-agent') ?? null,
                    sessionId: request.sessionID ?? null,
                    newValue: { username: dto.username, reason: 'invalid_totp' },
                });
                throw new UnauthorizedException('Invalid two-factor authentication code');
            }
        }

        await this.regenerateSession(request);
        request.session.isAuthenticated = true;
        request.session.username = adminUsername;
        await this.saveSession(request);

        await this.auditService.record({
            action: AuditAction.Login,
            entityType: 'auth',
            ip: request.ip ?? null,
            userAgent: request.header('user-agent') ?? null,
            sessionId: request.sessionID ?? null,
            newValue: { username: adminUsername },
        });

        return { isAuthenticated: true, username: adminUsername };
    }

    async setupTwoFactor(): Promise<{ secret: string; qrCodeDataUrl: string }> {
        const adminUsername = this.configService.getOrThrow<string>('ADMIN_USERNAME');
        const issuer = 'Self-Hosted CV';
        const secret = speakeasy.generateSecret({
            issuer,
            name: `${issuer}:${adminUsername}`,
            length: 32,
        });

        if (!secret.base32 || !secret.otpauth_url) {
            throw new UnauthorizedException('Unable to generate two-factor secret');
        }

        await this.upsertSetting(TOTP_SECRET_KEY, { secret: secret.base32 });
        await this.upsertSetting(TOTP_ENABLED_KEY, { enabled: false });

        return {
            secret: secret.base32,
            qrCodeDataUrl: await qrcode.toDataURL(secret.otpauth_url),
        };
    }

    async verifyTwoFactor(dto: TotpCodeDto, request: Request): Promise<{ enabled: true }> {
        const secret = await this.requireTotpSecret();

        if (!this.verifyToken(secret, dto.code)) {
            throw new UnauthorizedException('Invalid two-factor authentication code');
        }

        await this.upsertSetting(TOTP_ENABLED_KEY, { enabled: true });
        await this.auditService.record({
            action: AuditAction.TwoFactorVerify,
            entityType: 'auth',
            ip: request.ip ?? null,
            userAgent: request.header('user-agent') ?? null,
            sessionId: request.sessionID ?? null,
            newValue: { enabled: true },
        });

        return { enabled: true };
    }

    async disableTwoFactor(dto: TotpCodeDto, request: Request): Promise<{ enabled: false }> {
        const secret = await this.requireTotpSecret();

        if (!this.verifyToken(secret, dto.code)) {
            throw new UnauthorizedException('Invalid two-factor authentication code');
        }

        await this.upsertSetting(TOTP_ENABLED_KEY, { enabled: false });
        await this.auditService.record({
            action: AuditAction.TwoFactorSetup,
            entityType: 'auth',
            ip: request.ip ?? null,
            userAgent: request.header('user-agent') ?? null,
            sessionId: request.sessionID ?? null,
            newValue: { enabled: false },
        });

        return { enabled: false };
    }

    async logout(request: Request): Promise<{ isAuthenticated: false }> {
        const username = request.session.username ?? null;
        const sessionId = request.sessionID ?? null;

        await this.auditService.record({
            action: AuditAction.Logout,
            entityType: 'auth',
            ip: request.ip ?? null,
            userAgent: request.header('user-agent') ?? null,
            sessionId,
            newValue: { username },
        });

        await new Promise<void>((resolve, reject) => {
            request.session.destroy((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        return { isAuthenticated: false };
    }

    me(request: Request): { isAuthenticated: boolean; username: string | null } {
        return {
            isAuthenticated: request.session.isAuthenticated === true,
            username: request.session.username ?? null,
        };
    }

    private async regenerateSession(request: Request): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            request.session.regenerate((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    private async saveSession(request: Request): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            request.session.save((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    private async isTwoFactorEnabled(): Promise<boolean> {
        const setting = await this.settingModel.findOne({ where: { key: TOTP_ENABLED_KEY } });
        const enabled = setting?.value.enabled;

        return enabled === true;
    }

    private async getTotpSecret(): Promise<string | null> {
        const setting = await this.settingModel.findOne({ where: { key: TOTP_SECRET_KEY } });
        const secret = setting?.value.secret;

        return typeof secret === 'string' ? secret : null;
    }

    private async requireTotpSecret(): Promise<string> {
        const secret = await this.getTotpSecret();

        if (!secret) {
            throw new UnauthorizedException('Two-factor authentication is not configured');
        }

        return secret;
    }

    private verifyToken(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret,
            token,
            encoding: 'base32',
            window: TOTP_WINDOW,
        });
    }

    private async upsertSetting(key: string, value: Record<string, unknown>): Promise<void> {
        await this.settingModel.upsert({ key, value });
    }
}
