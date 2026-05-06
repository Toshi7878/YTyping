export const decodeText = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const bomEncoding = detectBomEncoding(bytes);
  if (bomEncoding) {
    return decode(buffer, bomEncoding);
  }

  const candidates = ["utf-8", "shift_jis", "euc-jp", "utf-16le", "utf-16be"]
    .map((encoding) => {
      const text = tryDecode(buffer, encoding);
      return text === null ? null : { text, score: scoreDecodedText(text) };
    })
    .filter((result): result is { text: string; score: number } => result !== null)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.text ?? decode(buffer, "utf-8");
};

const detectBomEncoding = (bytes: Uint8Array): string | null => {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
  return null;
};

const tryDecode = (buffer: ArrayBuffer, encoding: string): string | null => {
  try {
    return decode(buffer, encoding, true);
  } catch {
    return null;
  }
};

const decode = (buffer: ArrayBuffer, encoding: string, fatal = false) =>
  new TextDecoder(encoding, { fatal }).decode(buffer);

const scoreDecodedText = (text: string) => {
  let score = 0;

  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (char === "\uFFFD") score -= 100;
    else if (char === "[" || char === "]" || char === ":" || char === ".") score += 3;
    else if (char === "\n" || char === "\r" || char === "\t") score += 1;
    else if (codePoint >= 0x3040 && codePoint <= 0x30ff) score += 3;
    else if (codePoint >= 0x4e00 && codePoint <= 0x9fff) score += 3;
    else if (codePoint >= 0x20 && codePoint <= 0x7e) score += 1;
    else if (codePoint < 0x20) score -= 20;
  }

  return score;
};
