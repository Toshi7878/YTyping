export const getNowInTimeZone = (timeZone: string): Date => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  });

  return new Date(formatter.format(new Date()));
};

export const getYearDateRangeInTimeZone = (year: number): { startOfYear: Date; endOfYear: Date } => {
  const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 0, 0, 0, 0));

  return { startOfYear, endOfYear };
};

export const formatDateKeyInTimeZone = (date: Date, timeZone: string = "UTC"): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date); // YYYY-MM-DD
};
