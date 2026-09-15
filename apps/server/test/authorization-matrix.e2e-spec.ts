import { NotFoundException, type INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request, { type Response, type Test } from 'supertest';

import { AuthService } from '@/modules/auth/auth.service';
import { CvService } from '@/modules/cv/cv.service';
import { SettingsService } from '@/modules/settings/settings.service';
import { TemplateService } from '@/modules/template/template.service';

import { createTestApp } from './utils/create-test-app';

type HttpMethod = 'delete' | 'get' | 'post' | 'put';
type RouteExpectation = readonly [method: HttpMethod, path: string];

const PUBLIC_GET_ROUTES = [
  ['get', '/api'],
  ['get', '/api/cv'],
  ['get', '/api/health'],
  ['get', '/api/health/live'],
  ['get', '/api/health/ready'],
  ['get', '/api/site-settings'],
  ['get', '/api/templates'],
  ['get', '/api/templates/missing'],
  ['get', '/api/auth/me'],
  ['get', '/api/auth/csrf-token'],
] as const satisfies readonly RouteExpectation[];

const PROTECTED_GET_ROUTES = [
  ['get', '/api/admin/audit-logs'],
  ['get', '/api/admin/update-check'],
  ['get', '/api/admin/profile'],
  ['get', '/api/admin/sections'],
  ['get', '/api/admin/settings'],
  ['get', '/api/admin/settings/site'],
  ['get', '/api/admin/templates'],
  ['get', '/api/admin/experiences'],
  ['get', '/api/admin/writings'],
  ['get', '/api/admin/speakings'],
  ['get', '/api/admin/projects'],
  ['get', '/api/admin/educations'],
  ['get', '/api/admin/contacts'],
] as const satisfies readonly RouteExpectation[];

const PROTECTED_MUTATION_ROUTES = [
  ['post', '/api/admin/export'],
  ['post', '/api/auth/logout'],
  ['post', '/api/auth/2fa/setup'],
  ['post', '/api/auth/2fa/verify'],
  ['post', '/api/auth/2fa/disable'],
  ['post', '/api/admin/linkedin/upload'],
  ['post', '/api/admin/linkedin/import'],
  ['post', '/api/admin/media/presign'],
  ['post', '/api/admin/media/confirm'],
  ['delete', '/api/admin/media/test-id'],
  ['put', '/api/admin/profile'],
  ['put', '/api/admin/sections/reorder'],
  ['put', '/api/admin/settings'],
  ['put', '/api/admin/settings/site'],
  ['post', '/api/admin/experiences'],
  ['put', '/api/admin/experiences/reorder'],
  ['put', '/api/admin/experiences/test-id'],
  ['delete', '/api/admin/experiences/test-id'],
  ['post', '/api/admin/writings'],
  ['put', '/api/admin/writings/reorder'],
  ['put', '/api/admin/writings/test-id'],
  ['delete', '/api/admin/writings/test-id'],
  ['post', '/api/admin/speakings'],
  ['put', '/api/admin/speakings/reorder'],
  ['put', '/api/admin/speakings/test-id'],
  ['delete', '/api/admin/speakings/test-id'],
  ['post', '/api/admin/projects'],
  ['put', '/api/admin/projects/reorder'],
  ['put', '/api/admin/projects/test-id'],
  ['delete', '/api/admin/projects/test-id'],
  ['post', '/api/admin/educations'],
  ['put', '/api/admin/educations/reorder'],
  ['put', '/api/admin/educations/test-id'],
  ['delete', '/api/admin/educations/test-id'],
  ['post', '/api/admin/contacts'],
  ['put', '/api/admin/contacts/reorder'],
  ['put', '/api/admin/contacts/test-id'],
  ['delete', '/api/admin/contacts/test-id'],
] as const satisfies readonly RouteExpectation[];

function send(
  app: INestApplication<Server>,
  method: HttpMethod,
  path: string,
): Test {
  return request(app.getHttpServer())[method](path);
}

function readCsrfToken(response: Response): string {
  const body: unknown = response.body;
  if (
    typeof body !== 'object' ||
    body === null ||
    !('csrfToken' in body) ||
    typeof body.csrfToken !== 'string'
  ) {
    throw new TypeError('Expected a CSRF token response');
  }

  return body.csrfToken;
}

describe('Authorization matrix (e2e)', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    app = await createTestApp({
      overrides: [
        {
          provide: AuthService,
          useValue: {
            logout: jest.fn().mockResolvedValue({ isAuthenticated: false }),
            me: jest.fn().mockReturnValue({
              isAuthenticated: false,
              username: null,
            }),
          },
        },
        {
          provide: CvService,
          useValue: { getCv: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: SettingsService,
          useValue: { getSiteSettings: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: TemplateService,
          useValue: {
            findPublic: jest.fn().mockResolvedValue([]),
            findPublicByKey: jest
              .fn()
              .mockRejectedValue(
                new NotFoundException('CV template not found'),
              ),
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(PUBLIC_GET_ROUTES)(
    '%s %s is reachable anonymously',
    async (method, path) => {
      const response = await send(app, method, path);

      expect(response.status).not.toBe(401);
      expect(response.status).toBeLessThan(500);
    },
  );

  it('POST /api/auth/login reaches validation anonymously', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({});

    expect(response.status).toBe(400);
  });

  it.each(PROTECTED_GET_ROUTES)(
    '%s %s denies anonymous access',
    async (method, path) => {
      const response = await send(app, method, path);

      expect(response.status).toBe(401);
    },
  );

  it.each(PROTECTED_MUTATION_ROUTES)(
    '%s %s denies anonymous access',
    async (method, path) => {
      const response = await send(app, method, path).send({});

      // CSRF middleware runs before Nest guards for mutating requests.
      expect([401, 403]).toContain(response.status);
    },
  );

  it('denies anonymous logout after CSRF validation passes', async () => {
    const agent = request.agent(app.getHttpServer());
    const csrfResponse = await agent.get('/api/auth/csrf-token').expect(200);
    const csrfToken = readCsrfToken(csrfResponse);

    await agent
      .post('/api/auth/logout')
      .set('X-CSRF-Token', csrfToken)
      .expect(401);
  });
});
