import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { AuditAction } from '@/database/enums';
import { createMockModel } from '@/test-utils/mock-model';
import type { MockModel } from '@/test-utils/mock-model';

import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

// eslint-disable-next-line no-control-regex -- test asserts C0/C1 control chars are stripped
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/;

describe('AuditService', () => {
  let service: AuditService;
  let auditLogModel: MockModel<AuditLog>;

  beforeEach(async () => {
    auditLogModel = createMockModel<AuditLog>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getModelToken(AuditLog), useValue: auditLogModel },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(1024) },
        },
      ],
    }).compile();

    service = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('record', () => {
    it('truncates over-long userAgent and strips control chars', async () => {
      await service.record({
        action: AuditAction.Login,
        userAgent: `${'A'.repeat(5000)}\u0000\u0007bad`,
      });

      const createdLog = getCreatedLog(auditLogModel);
      const userAgent = createdLog['userAgent'];

      expect(typeof userAgent).toBe('string');
      if (typeof userAgent === 'string') {
        expect(userAgent.length).toBeLessThanOrEqual(1024);
        expect(userAgent).not.toMatch(CONTROL_CHARACTERS);
      }
    });

    it('sanitizes string values inside newValue deeply', async () => {
      await service.record({
        action: AuditAction.Update,
        newValue: {
          username: 'x\u0000y',
          nested: { a: 'b\u0001c' },
        },
      });

      const createdLog = getCreatedLog(auditLogModel);
      const newValue = createdLog['newValue'];

      expect(isRecord(newValue)).toBe(true);
      if (isRecord(newValue)) {
        expect(newValue['username']).toBe('xy');

        const nested = newValue['nested'];
        expect(isRecord(nested)).toBe(true);
        if (isRecord(nested)) {
          expect(nested['a']).toBe('bc');
        }
      }
    });

    it('passes through null fields unchanged', async () => {
      await service.record({
        action: AuditAction.Update,
        entityType: null,
        entityId: null,
        oldValue: null,
        newValue: null,
        ip: null,
        userAgent: null,
        sessionId: null,
      });

      expect(auditLogModel.create).toHaveBeenCalledWith(
        {
          action: AuditAction.Update,
          entityType: null,
          entityId: null,
          oldValue: null,
          newValue: null,
          ip: null,
          userAgent: null,
          sessionId: null,
        },
        undefined,
      );
    });
  });
});

function getCreatedLog(
  auditLogModel: MockModel<AuditLog>,
): Record<string, unknown> {
  const createdLog = auditLogModel.create.mock.calls[0]?.[0];

  expect(isRecord(createdLog)).toBe(true);
  return isRecord(createdLog) ? createdLog : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
