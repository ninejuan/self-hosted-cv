import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction, WhereOptions } from 'sequelize';

import { AuditAction } from '@/database/enums';

import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLog } from './entities/audit-log.entity';

// eslint-disable-next-line no-control-regex -- intentionally strips C0/C1 control chars from audit input
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/g;
const DEFAULT_AUDIT_MAX_FIELD_LEN = 1024;
const MAX_AUDIT_VALUE_DEPTH = 6;

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
    private readonly configService: ConfigService,
  ) {}

  async record(input: AuditLogInput, transaction?: Transaction): Promise<void> {
    await this.auditLogModel.create(
      {
        action: input.action,
        entityType: this.sanitizeString(input.entityType) ?? null,
        entityId: this.sanitizeString(input.entityId) ?? null,
        oldValue: this.sanitizeValue(input.oldValue) ?? null,
        newValue: this.sanitizeValue(input.newValue) ?? null,
        ip: this.sanitizeString(input.ip) ?? null,
        userAgent: this.sanitizeString(input.userAgent) ?? null,
        sessionId: input.sessionId ?? null,
      },
      transaction ? { transaction } : undefined,
    );
  }

  private sanitizeString(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }

    return value
      .replace(CONTROL_CHARACTERS, '')
      .trim()
      .slice(0, this.getMaxFieldLength());
  }

  private sanitizeValue(
    value: Record<string, unknown> | null | undefined,
  ): Record<string, unknown> | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }

    const seen = new WeakSet<object>();
    seen.add(value);

    return this.sanitizeRecord(value, 0, seen);
  }

  private sanitizeRecord(
    value: Record<string, unknown>,
    depth: number,
    seen: WeakSet<object>,
  ): Record<string, unknown> {
    const sanitizedValue: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      sanitizedValue[key] = this.sanitizeNestedValue(item, depth, seen);
    }

    return sanitizedValue;
  }

  private sanitizeNestedValue(
    value: unknown,
    depth: number,
    seen: WeakSet<object>,
  ): unknown {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (value === null || typeof value !== 'object') {
      return value;
    }

    // Break cycles (e.g. Sequelize instances with parent back-refs) before JSONB serialization.
    if (seen.has(value)) {
      return '[Circular]';
    }

    if (depth >= MAX_AUDIT_VALUE_DEPTH) {
      return '[Truncated]';
    }

    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.sanitizeNestedValue(item, depth + 1, seen),
      );
    }

    return this.sanitizeRecord(
      value as Record<string, unknown>,
      depth + 1,
      seen,
    );
  }

  private getMaxFieldLength(): number {
    return (
      this.configService.get<number>('AUDIT_MAX_FIELD_LEN') ??
      DEFAULT_AUDIT_MAX_FIELD_LEN
    );
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
