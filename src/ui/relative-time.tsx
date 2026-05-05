import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/utils/cn";
import { formatDate, toLocaleDateString } from "@/utils/date";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export const RelativeTime = ({ date, className }: RelativeTimeProps) => {
  return (
    <time
      dateTime={toLocaleDateString(date)}
      title={formatDate(date)}
      className={cn("overflow-hidden truncate text-ellipsis whitespace-nowrap", className)}
      suppressHydrationWarning
    >
      {formatDistanceToNowStrict(date, { addSuffix: true, locale: ja })}
    </time>
  );
};
