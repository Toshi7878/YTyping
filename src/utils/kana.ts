export const countKanaWordWithDakuonSplit = ({ kanaWord }: { kanaWord: string }) => {
  const dakuHandakuLineNotes = (kanaWord.match(/[ゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/g) || []).length;
  return kanaWord.length + dakuHandakuLineNotes;
};
