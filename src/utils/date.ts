type LocaleString = "ja-JP";

export const formatDate = (
  date: Date | string | number,
  locale?: LocaleString,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "medium",
  },
) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    hour12: false,
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
