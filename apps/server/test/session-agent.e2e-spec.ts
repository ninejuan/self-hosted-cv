import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';

import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';
import { createMockModel } from '@/test-utils/mock-model';

import { createTestApp } from './utils/create-test-app';
import { createSessionAgent } from './utils/session-agent';

describe('Session agent (e2e)', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const settings = createMockModel<{ value: Record<string, unknown> }>();
    settings.findOne
      .mockResolvedValueOnce({
        value: { username: process.env.ADMIN_USERNAME },
      })
      .mockResolvedValueOnce({
        value: { hash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? '', 4) },
      })
      .mockResolvedValueOnce({ value: { enabled: false } });

    app = await createTestApp({
      overrides: [
        { provide: getModelToken(AppSetting), useValue: settings },
        { provide: getModelToken(AuditLog), useValue: createMockModel() },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and attaches a CSRF token', async () => {
    const session = await createSessionAgent(app);
    const csrfToken = await session.getCsrfToken();

    expect(csrfToken).toEqual(expect.any(String));
    await session.withCsrf(session.agent.post('/api/auth/logout').expect(201));
  });
});
