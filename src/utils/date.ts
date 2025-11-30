export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "medium",
  },
) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour12: false,
    ...options,
  }).format(d);
};

export const toLocaleDateString = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString(undefined, { ...options });
};
