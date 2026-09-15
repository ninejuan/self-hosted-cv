import 'express-session';

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    authenticatedAt?: number;
    csrfInitialized?: boolean;
    username?: string;
  }
}
