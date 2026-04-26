import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';

import { AuditAction } from '@/database/enums';

import { AuditLogQueryDto } from './dto/audit-log-query.dto';
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
  constructor(
    @InjectModel(AuditLog) private readonly auditLogModel: typeof AuditLog,
  ) {}

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

  async query(dto: AuditLogQueryDto): Promise<{
    items: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: WhereOptions<AuditLog> = {};

    if (dto.action) {
      where.action = dto.action;
    }

    if (dto.entityType) {
      where.entityType = dto.entityType;
    }

    if (dto.from || dto.to) {
      where.createdAt = {
        ...(dto.from ? { [Op.gte]: new Date(dto.from) } : {}),
        ...(dto.to ? { [Op.lte]: new Date(dto.to) } : {}),
      };
    }

    const { rows, count } = await this.auditLogModel.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: dto.limit,
      offset: (dto.page - 1) * dto.limit,
    });

    return { items: rows, total: count, page: dto.page, limit: dto.limit };
  }
}
