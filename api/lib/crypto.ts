import crypto from 'node:crypto';

const ENCRYPTION_KEY_ENV = process.env.INTEGRATIONS_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

function getKey(): Buffer {
  if (!ENCRYPTION_KEY_ENV) {
    throw new Error('Missing INTEGRATIONS_ENCRYPTION_KEY');
  }
  // Accept 32-byte raw (base64) or 64-hex.
  if (/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY_ENV)) {
    return Buffer.from(ENCRYPTION_KEY_ENV, 'hex');
  }
  const asBase64 = Buffer.from(ENCRYPTION_KEY_ENV, 'base64');
  if (asBase64.length === 32) return asBase64;
  throw new Error('INTEGRATIONS_ENCRYPTION_KEY must be 32 bytes (base64) or 64 hex chars');
}

type EncryptedBlob = {
  v: 1;
  alg: 'aes-256-gcm';
  iv: string; // base64
  tag: string; // base64
  data: string; // base64
};

export function encryptString(plaintext: string): EncryptedBlob {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: data.toString('base64'),
  };
}

export function decryptString(blob: EncryptedBlob): string {
  if (!blob || blob.v !== 1 || blob.alg !== 'aes-256-gcm') {
    throw new Error('Unsupported encrypted blob');
  }
  const key = getKey();
  const iv = Buffer.from(blob.iv, 'base64');
  const tag = Buffer.from(blob.tag, 'base64');
  const data = Buffer.from(blob.data, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(data), decipher.final()]);
  return out.toString('utf8');
}

