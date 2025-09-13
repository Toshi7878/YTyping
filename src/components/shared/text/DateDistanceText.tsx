"use client";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

interface DateDistanceTextProps {
  date: Date | string;
  text?: string;
  addSuffix?: boolean;
}

const DateDistanceText = ({ date, text, addSuffix = true }: DateDistanceTextProps) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return (
    <time
      dateTime={dateObj.toISOString()}
      title={dateObj.toLocaleString("ja-JP")}
      className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
    >
      {formatDistanceToNowStrict(dateObj, { addSuffix, locale: ja })}
      {text && text}
    </time>
  );
};

export default DateDistanceText;
