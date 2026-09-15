import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

import { AuditAction } from '@/database/enums';
import { AuditService } from '@/modules/audit/audit.service';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';

import { LoginDto } from './dto/login.dto';
import { TotpCodeDto } from './dto/totp-code.dto';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly auditService: AuditService,
    private readonly twoFactorService: TwoFactorService,
    @InjectModel(AppSetting) private readonly settingModel: typeof AppSetting,
  ) {}

  async login(
    dto: LoginDto,
    request: Request,
  ): Promise<{ isAuthenticated: true; username: string }> {
    const adminUsernameSetting = await this.settingModel.findOne({
      where: { key: 'admin_username' },
    });
    const adminPasswordSetting = await this.settingModel.findOne({
      where: { key: 'admin_password_hash' },
    });
    const adminUsername = adminUsernameSetting?.value?.username as
      | string
      | undefined;
    const adminHash = adminPasswordSetting?.value?.hash as string | undefined;

    const isUsernameValid = !!adminUsername && dto.username === adminUsername;
    const isPasswordValid =
      !!adminHash && (await bcrypt.compare(dto.password, adminHash));

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

    if (await this.twoFactorService.isEnabled()) {
      if (
        !dto.totpCode ||
        !(await this.twoFactorService.verifyLoginToken(dto.totpCode))
      ) {
        await this.auditService.record({
          action: AuditAction.LoginFailed,
          entityType: 'auth',
          ip: request.ip ?? null,
          userAgent: request.header('user-agent') ?? null,
          sessionId: request.sessionID ?? null,
          newValue: { username: dto.username, reason: 'invalid_totp' },
        });
        throw new UnauthorizedException(
          'Invalid two-factor authentication code',
        );
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

  async setupTwoFactor(
    request: Request,
  ): Promise<{ secret: string; qrCodeDataUrl: string }> {
    return this.twoFactorService.setup(request);
  }

  async verifyTwoFactor(
    dto: TotpCodeDto,
    request: Request,
  ): Promise<{ enabled: true }> {
    return this.twoFactorService.verify(dto, request);
  }

  async disableTwoFactor(
    dto: TotpCodeDto,
    request: Request,
  ): Promise<{ enabled: false }> {
    return this.twoFactorService.disable(dto, request);
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
          reject(error instanceof Error ? error : new Error(String(error)));
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
          reject(error instanceof Error ? error : new Error(String(error)));
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
          reject(error instanceof Error ? error : new Error(String(error)));
          return;
        }
        resolve();
      });
    });
  }
}
