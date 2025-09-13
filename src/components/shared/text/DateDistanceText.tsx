"use client";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

interface DateDistanceTextProps {
  date: Date;
  text?: string;
  addSuffix?: boolean;
}

const DateDistanceText = ({ date, text, addSuffix = true }: DateDistanceTextProps) => {
  return (
    <time
      dateTime={date.toISOString()}
      title={new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        dateStyle: "short",
        timeStyle: "medium",
        hour12: false,
      }).format(date)}
      className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
      suppressHydrationWarning
    >
      {formatDistanceToNowStrict(date, { addSuffix, locale: ja })}
      {text && text}
    </time>
  );
};
export default DateDistanceText;
