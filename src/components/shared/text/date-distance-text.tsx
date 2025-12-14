"use client";
import { cn } from "@/lib/utils";

interface DateDistanceTextProps {
  date: Date | string;
  text?: string;
  addSuffix?: boolean;
  className?: string;
}

export const DateDistanceText = ({ date, text, addSuffix = true, className }: DateDistanceTextProps) => {
  return (
    <time
      // dateTime={toLocaleDateString(date)}
      // title={formatDate(date)}
      className={cn("truncate overflow-hidden text-ellipsis whitespace-nowrap", className)}
      suppressHydrationWarning
    >
      {/* {formatDistanceToNowStrict(date, { addSuffix, locale: ja })} */}
      {text && text}
    </time>
  );
};
