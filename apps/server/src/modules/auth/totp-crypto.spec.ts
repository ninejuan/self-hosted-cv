import { decryptSecret, encryptSecret } from './totp-crypto';

describe('TOTP secret encryption', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEncryptionKey = process.env.TOTP_ENCRYPTION_KEY;

  afterEach(() => {
    restoreEnvironment('NODE_ENV', originalNodeEnv);
    restoreEnvironment('TOTP_ENCRYPTION_KEY', originalEncryptionKey);
    jest.restoreAllMocks();
  });

  describe('encrypt/decrypt', () => {
    it('round-trips without storing the plaintext', () => {
      process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(32, 11).toString('base64');
      const plaintext = 'JBSWY3DPEHPK3PXP';

      const encrypted = encryptSecret(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toMatch(/^v1:/);
      expect(decryptSecret(encrypted)).toBe(plaintext);
    });
  });

  describe('decrypt', () => {
    it('returns plaintext input unchanged for backward compatibility', () => {
      process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(32, 13).toString('base64');

      expect(decryptSecret('JBSWY3DPEHPK3PXP')).toBe('JBSWY3DPEHPK3PXP');
    });
  });

  describe('encrypt without a key', () => {
    it('throws in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.TOTP_ENCRYPTION_KEY;

      expect(() => encryptSecret('secret')).toThrow('TOTP_ENCRYPTION_KEY');
    });

    it('falls back to plaintext in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.TOTP_ENCRYPTION_KEY;

      expect(encryptSecret('secret')).toBe('secret');
    });
  });
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
