const TELEGRAM_LINK_PATTERNS = [
  /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
  /^@\w+/,
];

const INSTAGRAM_LINK_PATTERNS = [
  /^https?:\/\/(www\.)?instagram\.com\/.+/i,
];

export function isValidTelegramLink(link: string): boolean {
  return TELEGRAM_LINK_PATTERNS.some((pattern) => pattern.test(link.trim()));
}

export function isValidInstagramLink(link: string): boolean {
  return INSTAGRAM_LINK_PATTERNS.some((pattern) => pattern.test(link.trim()));
}

export function isValidLink(link: string, platform: string): boolean {
  switch (platform.toUpperCase()) {
    case 'TELEGRAM':
      return isValidTelegramLink(link);
    case 'INSTAGRAM':
      return isValidInstagramLink(link);
    default:
      return false;
  }
}
