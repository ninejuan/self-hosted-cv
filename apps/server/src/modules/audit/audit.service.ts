import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { AuditAction } from '@/database/enums';

import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogInput {
    action: AuditAction;
    entityType?: string | null;
    entityId?: string | null;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ip?: string | null;
    userAgent?: string | null;
    sessionId?: string | null;
}

@Injectable()
export class AuditService {
    constructor(@InjectModel(AuditLog) private readonly auditLogModel: typeof AuditLog) {}

    async record(input: AuditLogInput): Promise<void> {
        await this.auditLogModel.create({
            action: input.action,
            entityType: input.entityType ?? null,
            entityId: input.entityId ?? null,
            oldValue: input.oldValue ?? null,
            newValue: input.newValue ?? null,
            ip: input.ip ?? null,
            userAgent: input.userAgent ?? null,
            sessionId: input.sessionId ?? null,
        });
    }
}
