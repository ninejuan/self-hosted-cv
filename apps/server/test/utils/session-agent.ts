import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request, { type Response } from 'supertest';

type SuperTestAgent = ReturnType<typeof request.agent>;

export type SessionAgent = {
  readonly agent: SuperTestAgent;
  getCsrfToken(): Promise<string>;
  withCsrf(test: request.Test): Promise<Response>;
};

function readCsrfToken(body: unknown): string {
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

export async function createSessionAgent(
  app: INestApplication<Server>,
): Promise<SessionAgent> {
  const agent = request.agent(app.getHttpServer());

  await agent
    .post('/api/auth/login')
    .send({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    })
    .expect(201);

  const getCsrfToken = async (): Promise<string> => {
    const response = await agent.get('/api/auth/csrf-token').expect(200);
    return readCsrfToken(response.body);
  };

  return {
    agent,
    getCsrfToken,
    withCsrf: async (test): Promise<Response> =>
      await test.set('X-CSRF-Token', await getCsrfToken()),
  };
}
