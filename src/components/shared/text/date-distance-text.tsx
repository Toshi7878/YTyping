"use client";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateDistanceTextProps {
  date: Date | string;
  text?: string;
  addSuffix?: boolean;
  className?: string;
}

export const DateDistanceText = ({ date, text, addSuffix = true, className }: DateDistanceTextProps) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return (
    <time
      dateTime={dateObj.toISOString()}
      title={new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        dateStyle: "short",
        timeStyle: "medium",
        hour12: false,
      }).format(dateObj)}
      className={cn("truncate overflow-hidden text-ellipsis whitespace-nowrap", className)}
      suppressHydrationWarning
    >
      {formatDistanceToNowStrict(dateObj, { addSuffix, locale: ja })}
      {text && text}
    </time>
  );
};
