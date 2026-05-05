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
