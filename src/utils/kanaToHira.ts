export const kanaToHira = (lyrics: string) => {
  return lyrics
    .replace(/[\u30a1-\u30f6]/g, function (match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    })
    .replace(/ヴ/g, "ゔ");
};
