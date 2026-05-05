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

export const countKanaWordWithDakuonSplit = ({ kanaWord }: { kanaWord: string }) => {
  const dakuHandakuLineNotes = (kanaWord.match(/[ゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/g) || []).length;
  return kanaWord.length + dakuHandakuLineNotes;
};
