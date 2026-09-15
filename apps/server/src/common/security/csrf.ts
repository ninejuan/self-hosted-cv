import { ForbiddenException, type INestApplication } from '@nestjs/common';
import { doubleCsrf } from 'csrf-csrf';
import type { NextFunction, Request, Response } from 'express';

export type CsrfConfig = {
  readonly secret: string;
  readonly secure: boolean;
};

export type CsrfTokenRequest = Request & {
  readonly generateCsrfToken: () => string;
};

const CSRF_COOKIE_NAME = 'cv.csrf-token';
const CSRF_TOKEN_PATH = '/api/auth/csrf-token';
const LOGIN_PATH = '/api/auth/login';
const MUTATING_METHODS: ReadonlySet<string> = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

export function applyCsrf<TServer>(
  app: INestApplication<TServer>,
  config: CsrfConfig,
): void {
  const { doubleCsrfProtection, generateCsrfToken, invalidCsrfTokenError } =
    doubleCsrf({
      getSecret: () => config.secret,
      getSessionIdentifier: (request) => request.sessionID,
      cookieName: CSRF_COOKIE_NAME,
      cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.secure,
      },
      getCsrfTokenFromRequest: (request) => request.headers['x-csrf-token'],
    });

  app.use((request: Request, response: Response, next: NextFunction) => {
    const path = request.originalUrl ?? request.url;

    if (request.method === 'GET' && path.startsWith(CSRF_TOKEN_PATH)) {
      request.session.csrfInitialized = true;
      Object.defineProperty(request, 'generateCsrfToken', {
        configurable: true,
        value: () => generateCsrfToken(request, response),
      });
      next();
      return;
    }

    if (!MUTATING_METHODS.has(request.method)) {
      next();
      return;
    }

    // Login is unauthenticated and regenerates the session after success.
    if (request.method === 'POST' && path.startsWith(LOGIN_PATH)) {
      next();
      return;
    }

    doubleCsrfProtection(request, response, (error?: unknown) => {
      if (error === invalidCsrfTokenError) {
        next(new ForbiddenException('Invalid CSRF token'));
        return;
      }

      next(error);
    });
  });
}
