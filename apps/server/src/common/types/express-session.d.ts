import 'express-session';

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    authenticatedAt?: number;
    authLevel?: 'password' | 'mfa';
    csrfInitialized?: boolean;
    username?: string;
  }
}
