export const kanaToHira = (text: string) => {
  return text
    .replaceAll(/[\u30A1-\u30F6]/g, (match) => {
      const codePoint = match.codePointAt(0);
      if (codePoint === undefined) return match;
      const chr = codePoint - 0x60;

      return String.fromCodePoint(chr);
    })
    .replaceAll("ヴ", "ゔ");
};

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
  return (
    text
      .replaceAll(
        /([^\u0020-\u007E])([!?]+)/g,
        (_, p1: string, p2: string) => p1 + p2.replaceAll("!", "！").replaceAll("?", "？"),
      )
      // ASCII の直後に続く "！？" の並びは半角へ
      .replaceAll(
        /([\u0020-\u007E])([！？]+)/g,
        (_, p1: string, p2: string) => p1 + p2.replaceAll("！", "!").replaceAll("？", "?"),
      )
  );
};
