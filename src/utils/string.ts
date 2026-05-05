export const normalizeFullWidthAlnum = (text: string) => {
  return text.replaceAll(/[０-９Ａ-Ｚａ-ｚ]/g, (s) => {
    const cp = s.codePointAt(0);
    return cp == null ? s : String.fromCodePoint(cp - 0xfee0);
  });
};

export const normalizeSymbols = (text: string) => {
  return text
    .replaceAll("…", "...")
    .replaceAll("‥", "..")
    .replaceAll("･", "・")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("’", "'")
    .replaceAll("〜", "～")
    .replaceAll("｢", "「")
    .replaceAll("｣", "」")
    .replaceAll("､", "、")
    .replaceAll("｡", "。")
    .replaceAll("－", "ー")
    .replaceAll("　", " ")
    .replaceAll(/ {2,}/g, " ")
    .trim();
};

export const normalizeExclamationQuestionMarks = (text: string) => {
  return text
    .replaceAll(
      /([^\u0020-\u007E])([!?]+)/g,
      (_, p1: string, p2: string) => p1 + p2.replaceAll("!", "！").replaceAll("?", "？"),
    )
    .replaceAll(
      /([\u0020-\u007E])([！？]+)/g,
      (_, p1: string, p2: string) => p1 + p2.replaceAll("！", "!").replaceAll("？", "?"),
    );
};

/**
 * 半角カナを全角化したうえで、カタカナをひらがなに変換する
 */
export const katakanaToHiragana = (text: string): string => {
  const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;
  return text.normalize("NFKC").replace(/[\u30A1-\u30F6]/g, (char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) return char;

    return String.fromCodePoint(codePoint - KATAKANA_TO_HIRAGANA_OFFSET);
  });
};
