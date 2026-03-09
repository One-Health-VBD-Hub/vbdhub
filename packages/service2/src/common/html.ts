const HTML_ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
};

export const stripHtmlTags = (value: string): string =>
  value.replace(/<[^>]*>/g, ' ');

export const decodeHtmlEntities = (value: string): string =>
  value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith('#')) {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePointText = isHex ? entity.slice(2) : entity.slice(1);
      const codePoint = Number.parseInt(codePointText, isHex ? 16 : 10);
      if (Number.isNaN(codePoint)) return match;

      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }

    return HTML_ENTITY_MAP[entity.toLowerCase()] ?? match;
  });

export const sanitizeHtmlText = (
  value: string | undefined
): string | undefined => {
  if (!value) return undefined;

  if (!value.includes('<') && !value.includes('&')) {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  let text = value;

  if (text.includes('<')) {
    text = stripHtmlTags(text);
  }

  if (text.includes('&')) {
    text = decodeHtmlEntities(text);
  }

  if (text.includes('<')) {
    text = stripHtmlTags(text);
  }

  if (/\s{2,}|\r|\n|\t/.test(text)) {
    text = text.replace(/\s+/g, ' ');
  }

  const normalized = text.trim();
  return normalized || undefined;
};
