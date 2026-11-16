type LocaleString = "ja-JP" | "en-US";
export const JST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * サーバーとブラウザで同じ文字列になるよう、ロケールとタイムゾーンはデフォルトで日本(ja-JP / Asia/Tokyo)に固定する。
 * 未指定だとサーバー(en-US/UTC など)とブラウザの設定が食い違い、ハイドレーションエラーになる
 */
export const formatDate = (
  date: Date | string | number,
  locale: LocaleString = "ja-JP",
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "medium",
  },
) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    hour12: false,
    timeZone: "Asia/Tokyo",
    ...options,
  }).format(d);
};

export const toLocaleDateString = (
  date: Date | string | number,
  locale?: LocaleString,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString(locale, { ...options });
};

export const getTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getYearsDesc = ({
  oldestYear,
  currentYear = new Date().getFullYear(),
}: {
  oldestYear?: number;
  currentYear?: number;
}): number[] => {
  const oldest = oldestYear ?? currentYear;
  const start = Math.min(oldest, currentYear);
  const end = Math.max(oldest, currentYear);
  return Array.from({ length: end - start + 1 }, (_, i) => end - i);
};
