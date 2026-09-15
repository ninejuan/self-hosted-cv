import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Inject, Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import type { Request } from 'express';
import qrcode from 'qrcode';
import type { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import speakeasy from 'speakeasy';

import { AuditAction } from '@/database/enums';
import { AuditService } from '@/modules/audit/audit.service';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';

import { AuthSessionService } from './auth-session.service';
import { TotpCodeDto } from './dto/totp-code.dto';
import { decryptSecret, encryptSecret, isEncryptedSecret } from './totp-crypto';

const TOTP_SECRET_KEY = 'totp_secret';
const TOTP_PENDING_SECRET_KEY = 'totp_pending_secret';
const TOTP_ENABLED_KEY = 'totp_enabled';
const TOTP_WINDOW = 1;

type StoredSecret = {
  readonly encrypted: string;
  readonly plaintext: string;
};

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly authSessionService: AuthSessionService,
    @InjectModel(AppSetting) private readonly settingModel: typeof AppSetting,
    @Inject(getConnectionToken()) private readonly sequelize: Sequelize,
  ) {}

  async setup(
    request: Request,
  ): Promise<{ secret: string; qrCodeDataUrl: string }> {
    const usernameSetting = await this.settingModel.findOne({
      where: { key: 'admin_username' },
    });
    const adminUsername =
      (usernameSetting?.value.username as string) ?? 'admin';
    const issuer = 'Self-Hosted CV';
    const secret = speakeasy.generateSecret({
      issuer,
      name: `${issuer}:${adminUsername}`,
      length: 32,
    });

    if (!secret.base32 || !secret.otpauth_url) {
      throw new BadRequestException('Unable to generate two-factor secret');
    }

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    await this.sequelize.transaction(async (transaction) => {
      await this.upsertSetting(
        TOTP_PENDING_SECRET_KEY,
        { secret: encryptSecret(secret.base32) },
        transaction,
      );
      await this.auditService.record(
        this.createAuditInput(AuditAction.TwoFactorSetup, request, false),
        transaction,
      );
    });

    return {
      secret: secret.base32,
      qrCodeDataUrl,
    };
  }

  async verify(dto: TotpCodeDto, request: Request): Promise<{ enabled: true }> {
    const pendingSecret = await this.getStoredSecret(TOTP_PENDING_SECRET_KEY);

    if (!pendingSecret) {
      throw new BadRequestException(
        'Two-factor authentication setup has not been started',
      );
    }

    this.requireValidToken(pendingSecret.plaintext, dto.code);
    const encryptedSecret = isEncryptedSecret(pendingSecret.encrypted)
      ? pendingSecret.encrypted
      : encryptSecret(pendingSecret.plaintext);

    await this.sequelize.transaction(async (transaction) => {
      await this.upsertSetting(
        TOTP_SECRET_KEY,
        { secret: encryptedSecret },
        transaction,
      );
      await this.upsertSetting(
        TOTP_ENABLED_KEY,
        { enabled: true },
        transaction,
      );
      await this.settingModel.destroy({
        where: { key: TOTP_PENDING_SECRET_KEY },
        transaction,
      });
      await this.auditService.record(
        this.createAuditInput(AuditAction.TwoFactorVerify, request, true),
        transaction,
      );
    });
    await this.destroyOtherSessions(request.sessionID);

    return { enabled: true };
  }

  async disable(
    dto: TotpCodeDto,
    request: Request,
  ): Promise<{ enabled: false }> {
    const activeSecret = await this.getStoredSecret(TOTP_SECRET_KEY);

    if (!activeSecret) {
      throw new BadRequestException(
        'Two-factor authentication is not configured',
      );
    }

    this.requireValidToken(activeSecret.plaintext, dto.code);

    await this.sequelize.transaction(async (transaction) => {
      await this.upsertSetting(
        TOTP_ENABLED_KEY,
        { enabled: false },
        transaction,
      );
      await this.settingModel.destroy({
        where: { key: [TOTP_SECRET_KEY, TOTP_PENDING_SECRET_KEY] },
        transaction,
      });
      await this.auditService.record(
        this.createAuditInput(AuditAction.TwoFactorDisable, request, false),
        transaction,
      );
    });
    await this.destroyOtherSessions(request.sessionID);

    return { enabled: false };
  }

  async isEnabled(): Promise<boolean> {
    const setting = await this.settingModel.findOne({
      where: { key: TOTP_ENABLED_KEY },
    });

    return setting?.value.enabled === true;
  }

  async verifyLoginToken(token: string): Promise<boolean> {
    const activeSecret = await this.getStoredSecret(TOTP_SECRET_KEY);

    if (!activeSecret || !this.verifyToken(activeSecret.plaintext, token)) {
      return false;
    }

    if (!isEncryptedSecret(activeSecret.encrypted)) {
      const encryptedSecret = encryptSecret(activeSecret.plaintext);

      if (encryptedSecret !== activeSecret.encrypted) {
        await this.settingModel.upsert({
          key: TOTP_SECRET_KEY,
          value: { secret: encryptedSecret },
        });
      }
    }

    return true;
  }

  private async getStoredSecret(key: string): Promise<StoredSecret | null> {
    const setting = await this.settingModel.findOne({ where: { key } });
    const encrypted = setting?.value.secret;

    if (typeof encrypted !== 'string') {
      return null;
    }

    return { encrypted, plaintext: decryptSecret(encrypted) };
  }

  private requireValidToken(secret: string, token: string): void {
    if (!this.verifyToken(secret, token)) {
      throw new UnauthorizedException('Invalid two-factor authentication code');
    }
  }

  private verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      token,
      encoding: 'base32',
      window: TOTP_WINDOW,
    });
  }

  private async upsertSetting(
    key: string,
    value: Record<string, unknown>,
    transaction: Transaction,
  ): Promise<void> {
    await this.settingModel.upsert({ key, value }, { transaction });
  }

  private createAuditInput(
    action: AuditAction,
    request: Request,
    enabled: boolean,
  ) {
    return {
      action,
      entityType: 'auth',
      ip: request.ip ?? null,
      userAgent: request.header('user-agent') ?? null,
      sessionId: request.sessionID ?? null,
      newValue: { enabled },
    };
  }

  private async destroyOtherSessions(currentSessionId: string): Promise<void> {
    try {
      await this.authSessionService.destroyOtherSessions(currentSessionId);
    } catch {
      this.logger.warn('Unable to invalidate other authentication sessions');
    }
  }
}
