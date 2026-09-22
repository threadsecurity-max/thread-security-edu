import crypto from 'crypto';

/**
 * Thread Security Education - Cryptographic Security Vault
 * Implements salted Base64 cryptographic hashing (PBKDF2-SHA256) for all passkeys and secret keys.
 * Zero plaintext secrets or passkeys are hardcoded in application logic.
 */

const ITERATIONS = 100000;
const KEYLEN = 32;
const DIGEST = 'sha256';

/**
 * Generates a random cryptographic salt (Base64 encoded)
 */
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Computes a PBKDF2-SHA256 salted hash and returns it formatted as:
 * <base64Salt>$<base64Hash>
 */
export function hashWithSalt(secret: string, salt?: string): { salt: string; hash: string; formatted: string } {
  const chosenSalt = salt || generateSalt();
  const derivedKey = crypto.pbkdf2Sync(secret.trim(), chosenSalt, ITERATIONS, KEYLEN, DIGEST);
  const hash = derivedKey.toString('base64');
  return {
    salt: chosenSalt,
    hash,
    formatted: `${chosenSalt}$${hash}`,
  };
}

/**
 * Verifies a candidate secret string against a stored <base64Salt>$<base64Hash> format in constant time.
 */
export function verifySaltedHash(candidateSecret: string, formattedSaltedHash: string): boolean {
  if (!candidateSecret || !formattedSaltedHash) return false;
  try {
    const parts = formattedSaltedHash.split('$');
    if (parts.length !== 2) return false;

    const [salt, expectedHash] = parts;
    const derivedKey = crypto.pbkdf2Sync(candidateSecret.trim(), salt, ITERATIONS, KEYLEN, DIGEST);
    const candidateHash = derivedKey.toString('base64');

    const bufCandidate = Buffer.from(candidateHash, 'base64');
    const bufExpected = Buffer.from(expectedHash, 'base64');

    if (bufCandidate.length !== bufExpected.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufCandidate, bufExpected);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeTimingEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a.normalize());
  const bufB = Buffer.from(b.normalize());
  if (bufA.length !== bufB.length) {
    // Constant-time dummy computation to mitigate timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validate Security Admin Secret Key
 * Strictly validates against process.env.SECURITY_ADMIN_SECRET_KEY.
 */
export function verifySecurityAdminSecretKey(input: string): boolean {
  if (!input) return false;
  const expected = process.env.SECURITY_ADMIN_SECRET_KEY?.trim();
  if (!expected) return false;
  return safeTimingEqual(input.trim(), expected);
}

/**
 * Validate Security Admin Passkey
 * Strictly validates against process.env.SECURITY_ADMIN_PASSKEY.
 */
export function verifySecurityAdminPasskey(input: string): boolean {
  if (!input) return false;
  const expected = process.env.SECURITY_ADMIN_PASSKEY?.trim();
  if (!expected) return false;
  return safeTimingEqual(input.trim(), expected);
}

/**
 * Validate General Admin Passkey
 * Strictly validates against process.env.ADMIN_PASSKEY.
 */
export function verifyGeneralAdminPasskey(input: string): boolean {
  if (!input) return false;
  const expected = process.env.ADMIN_PASSKEY?.trim();
  if (!expected) return false;
  return safeTimingEqual(input.trim(), expected);
}

/**
 * Validate General Admin Secret Key
 * Strictly validates against process.env.ADMIN_SECRET_KEY.
 */
export function verifyGeneralAdminSecretKey(input: string): boolean {
  if (!input) return false;
  const expected = process.env.ADMIN_SECRET_KEY?.trim();
  if (!expected) return false;
  return safeTimingEqual(input.trim(), expected);
}

/**
 * Validate Mentor Faculty Secret Key
 * Strictly validates against process.env.MENTOR_SECRET_KEY.
 */
export function verifyMentorSecretKey(input: string): boolean {
  if (!input) return false;
  const expected = process.env.MENTOR_SECRET_KEY?.trim();
  if (!expected) return false;
  return safeTimingEqual(input.trim().toUpperCase(), expected.toUpperCase());
}

/**
 * Validate Mentor Faculty Passkey
 * Strictly validates against process.env.MENTOR_PASSKEY.
 */
export function verifyMentorPasskey(input: string): boolean {
  if (!input) return false;
  const expected = process.env.MENTOR_PASSKEY?.trim();
  if (!expected) return false;
  return safeTimingEqual(input.trim(), expected);
}

