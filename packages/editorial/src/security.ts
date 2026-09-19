/**
 * @irich/editorial
 * Security validation and defense-in-depth sanitization for editorial URL props.
 */

// Regex checking for dangerous protocols (case-insensitive)
const DANGEROUS_PROTOCOL_REGEX = /^(?:javascript|vbscript|data|blob):/i;

function normalizeUrl(url: string): string {
  // Strip leading control characters (ASCII 0-31) and whitespace
  let start = 0;
  while (start < url.length && url.charCodeAt(start) <= 32) {
    start++;
  }
  return url.slice(start);
}

/**
 * Validates whether a link URL is safe for navigation.
 * Permits http, https, mailto, tel, relative paths, and anchor fragments.
 * Strictly rejects javascript:, vbscript:, data:, and blob: schemes.
 */
export function isSafeHref(url: unknown): boolean {
  if (url === undefined || url === null || url === '') {
    return true;
  }
  if (typeof url !== 'string') {
    return false;
  }

  const normalized = normalizeUrl(url);
  if (DANGEROUS_PROTOCOL_REGEX.test(normalized)) {
    return false;
  }

  return true;
}

/**
 * Validates whether an image source URL is safe.
 * Permits http, https, and safe relative paths.
 * Strictly rejects data:, blob:, javascript:, and vbscript: in Phase 6.
 */
export function isSafeImageSrc(url: unknown): boolean {
  if (url === undefined || url === null || url === '') {
    return true;
  }
  if (typeof url !== 'string') {
    return false;
  }

  const normalized = normalizeUrl(url);
  if (DANGEROUS_PROTOCOL_REGEX.test(normalized)) {
    return false;
  }

  return true;
}

/**
 * Defense-in-depth sanitization for link URLs at render time.
 * Returns '#' if an unsafe URL bypassed validation.
 */
export function sanitizeHref(url: string | undefined | null, fallback = '#'): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }
  return isSafeHref(url) ? url : fallback;
}

/**
 * Defense-in-depth sanitization for image sources at render time.
 * Returns empty string if an unsafe URL bypassed validation.
 */
export function sanitizeImageSrc(url: string | undefined | null, fallback = ''): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }
  return isSafeImageSrc(url) ? url : fallback;
}
