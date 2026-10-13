/**
 * Utility to safely extract clean embed URL from raw iframe string, script, or plain URL.
 */
export function extractEmbedUrl(input: string): string {
  if (!input) return '';

  const trimmed = input.trim();

  // If plain URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it contains quotes or html tags
    const match = trimmed.match(/^https?:\/\/[^\s"'<>]+/);
    return match ? match[0] : trimmed;
  }

  // If raw iframe tag: e.g. <iframe src="https://..." ...>
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1];
  }

  return trimmed;
}

/**
 * Validates whether a given URL is safe for embedding
 */
export function isValidEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
