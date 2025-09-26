export const normalizeSimilarSymbol = (text: string) => {
  return text
    .replaceAll("…", "...")
    .replaceAll("‥", "..")
    .replaceAll("･", "・")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("〜", "～")
    .replaceAll("｢", "「")
    .replaceAll("｣", "」")
    .replaceAll("､", "、")
    .replaceAll("｡", "。")
    .replaceAll("－", "ー")
    .replaceAll("　", " ")
    .replaceAll(/ {2,}/g, " ")
    .trim()
}
