/**
 * Universal helper for extracting consistent user initials / monogram avatar text.
 * Always returns 2 characters (e.g. "VG") across all components in the app.
 */
export function getUserInitials(user) {
  if (!user) return 'VG';
  const raw = typeof user === 'string' ? user : (user.fullName || user.username || '');
  const email = typeof user === 'object' ? (user.email || '') : '';

  const source = raw ? raw.trim() : '';
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    // Single word / acronym: check for multiple uppercase letters like "VG"
    const uppers = source.match(/[A-Z]/g);
    if (uppers && uppers.length >= 2) {
      return `${uppers[0]}${uppers[1]}`.toUpperCase();
    }
    if (source.length >= 2) {
      return source.slice(0, 2).toUpperCase();
    }
  }

  // Fallback to email local-part
  if (email) {
    const localPart = email.split('@')[0];
    const emailParts = localPart.split(/[._-]+/).filter(Boolean);
    if (emailParts.length >= 2) {
      return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
    }
    if (localPart.length >= 2) {
      return localPart.slice(0, 2).toUpperCase();
    }
  }

  return 'VG';
}
