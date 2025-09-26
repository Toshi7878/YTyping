"use client"
import { formatDistanceToNowStrict } from "date-fns"
import { ja } from "date-fns/locale"

interface DateDistanceTextProps {
  date: Date | string
  text?: string
  addSuffix?: boolean
}

const DateDistanceText = ({ date, text, addSuffix = true }: DateDistanceTextProps) => {
  const dateObj = typeof date === "string" ? new Date(date) : date

  return (
    <time
      dateTime={dateObj.toISOString()}
      title={new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        dateStyle: "short",
        timeStyle: "medium",
        hour12: false,
      }).format(dateObj)}
      className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
      suppressHydrationWarning
    >
      {formatDistanceToNowStrict(dateObj, { addSuffix, locale: ja })}
      {text && text}
    </time>
  )
}
export default DateDistanceText
