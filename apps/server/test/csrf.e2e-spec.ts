import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request, { type Response } from 'supertest';

import { createTestApp } from './utils/create-test-app';

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

describe('csrf', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/auth/csrf-token returns a token and sets cookie', async () => {
    // Given
    const agent = request.agent(app.getHttpServer());

    // When
    const response = await agent.get('/api/auth/csrf-token').expect(200);

    // Then
    const csrfToken = readCsrfToken(response);
    const cookies = response.get('Set-Cookie') ?? [];
    const csrfCookie = cookies.find((cookie) =>
      cookie.includes(encodeURIComponent(csrfToken)),
    );
    expect(csrfToken).not.toHaveLength(0);
    expect(csrfCookie).toEqual(expect.stringContaining('HttpOnly'));
    expect(csrfCookie).toEqual(expect.stringContaining('SameSite=Lax'));
  });

  it('mutating request without token returns 403', async () => {
    // Given
    const agent = request.agent(app.getHttpServer());

    // When
    const response = await agent.post('/api/auth/logout').send({});

    // Then
    expect(response.status).toBe(403);
  });

  it('mutating request with an invalid token returns 403', async () => {
    // Given
    const agent = request.agent(app.getHttpServer());
    await agent.get('/api/auth/csrf-token').expect(200);

    // When
    const response = await agent
      .post('/api/auth/logout')
      .set('X-CSRF-Token', 'invalid-token')
      .send({});

    // Then
    expect(response.status).toBe(403);
  });

  it('mutating request with fetched token and cookie passes CSRF', async () => {
    // Given
    const agent = request.agent(app.getHttpServer());
    const csrfResponse = await agent.get('/api/auth/csrf-token').expect(200);
    const csrfToken = readCsrfToken(csrfResponse);

    // When
    const response = await agent
      .post('/api/auth/logout')
      .set('X-CSRF-Token', csrfToken)
      .send({});

    // Then
    expect(response.status).toBe(401);
  });

  it('POST /api/auth/login without token is exempt', async () => {
    // Given
    const agent = request.agent(app.getHttpServer());

    // When
    const response = await agent.post('/api/auth/login').send({});

    // Then
    expect(response.status).toBe(400);
  });
});
