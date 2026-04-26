import { Controller, Get, Query } from '@nestjs/common';

import { AuditService } from './audit.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLog } from './entities/audit-log.entity';

@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  query(@Query() dto: AuditLogQueryDto): Promise<{
    items: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.auditService.query(dto);
  }
}
