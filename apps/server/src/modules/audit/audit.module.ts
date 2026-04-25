import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditLog } from './entities/audit-log.entity';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

@Module({
    imports: [SequelizeModule.forFeature([AuditLog])],
    providers: [AuditService, AuditInterceptor],
    exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
