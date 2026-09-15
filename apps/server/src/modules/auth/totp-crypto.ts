import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTED_PREFIX = 'v1';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

export class TotpEncryptionError extends Error {
  readonly name = 'TotpEncryptionError';
}

export function encryptSecret(secret: string): string {
  const key = getEncryptionKey();

  if (!key) {
    return secret;
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);

  return [
    ENCRYPTED_PREFIX,
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    ciphertext.toString('base64url'),
  ].join(':');
}

export function decryptSecret(value: string): string {
  if (!isEncryptedSecret(value)) {
    return value;
  }

  const key = getEncryptionKey();

  if (!key) {
    throw new TotpEncryptionError(
      'TOTP_ENCRYPTION_KEY is required to decrypt TOTP secrets',
    );
  }

  const [, encodedIv, encodedTag, encodedCiphertext] = value.split(':');

  if (!encodedIv || !encodedTag || !encodedCiphertext) {
    throw new TotpEncryptionError('Invalid encrypted TOTP secret');
  }

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(encodedIv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch (error) {
    throw new TotpEncryptionError('Unable to decrypt TOTP secret', {
      cause: error,
    });
  }
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(`${ENCRYPTED_PREFIX}:`);
}

function getEncryptionKey(): Buffer | null {
  const encodedKey = process.env.TOTP_ENCRYPTION_KEY;

  if (!encodedKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new TotpEncryptionError(
        'TOTP_ENCRYPTION_KEY is required in production',
      );
    }

    return null;
  }

  const key = Buffer.from(encodedKey, 'base64');

  if (key.length !== KEY_LENGTH) {
    throw new TotpEncryptionError(
      'TOTP_ENCRYPTION_KEY must be a base64-encoded 32-byte key',
    );
  }

  return key;
}
