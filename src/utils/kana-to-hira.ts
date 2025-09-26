export const kanaToHira = (lyrics: string) => {
  return lyrics
    .replaceAll(/[\u30A1-\u30F6]/g, (match) => {
      const codePoint = match.codePointAt(0)
      if (codePoint === undefined) return match
      const chr = codePoint - 0x60

      return String.fromCodePoint(chr)
    })
    .replaceAll("ヴ", "ゔ")
}
