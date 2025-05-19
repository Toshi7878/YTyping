export const normalizeSimilarSymbol = (text: string) => {
  return text
    .replace(/\r$/, "")
    .replace(/…/g, "...")
    .replace(/‥/g, "..")
    .replace(/･/g, "・")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/〜/g, "～")
    .replace(/｢/g, "「")
    .replace(/｣/g, "」")
    .replace(/､/g, "、")
    .replace(/｡/g, "。")
    .replace(/－/g, "ー")
    .replace(/　/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
};
