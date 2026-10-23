/**
 * Utility functions for JWT decoding and expiration validation.
 * Uses native browser atob and utf-8 decode (zero external dependencies).
 */

export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

/**
 * Returns remaining milliseconds until token expires.
 * @param {string} token 
 * @returns {number} Milliseconds remaining, or 0 if expired/invalid.
 */
export function getTokenRemainingMs(token) {
  if (!token) return 0;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return 0;
  const remainingMs = decoded.exp * 1000 - Date.now();
  return remainingMs > 0 ? remainingMs : 0;
}

/**
 * Checks if a JWT token is expired.
 * @param {string} token - The JWT string
 * @param {number} [offsetSeconds=0] - Buffer time in seconds. E.g. 60 means treat as expired if within 60s of expiry.
 * @returns {boolean} True if expired or invalid, false if still valid.
 */
export function isTokenExpired(token, offsetSeconds = 0) {
  if (!token) return true;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  const expiryTimeMs = decoded.exp * 1000;
  const bufferMs = offsetSeconds * 1000;
  return Date.now() + bufferMs >= expiryTimeMs;
}

/**
 * Returns remaining seconds until token expires.
 * @param {string} token 
 * @returns {number} Seconds remaining, or 0 if expired/invalid.
 */
export function getTokenRemainingSeconds(token) {
  if (!token) return 0;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return 0;
  const remainingMs = decoded.exp * 1000 - Date.now();
  return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
}

/**
 * Checks if token is expiring within threshold (default 2 minutes).
 * @param {string} token 
 * @param {number} [thresholdSeconds=120] 
 * @returns {boolean}
 */
export function isTokenExpiringSoon(token, thresholdSeconds = 120) {
  return isTokenExpired(token, thresholdSeconds);
}

/**
 * Returns the Date object of the token's expiration.
 * @param {string} token 
 * @returns {Date|null}
 */
export function getTokenExpiryDate(token) {
  const decoded = parseJwt(token);
  return decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;
}
