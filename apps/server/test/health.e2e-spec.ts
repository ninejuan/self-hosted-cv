import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';

import { createTestApp } from './utils/create-test-app';

describe('Health (e2e)', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns 200', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });
});
