import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

import { AuditAction } from '@/database/enums';
import { AuditService } from '@/modules/audit/audit.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly auditService: AuditService,
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
}
