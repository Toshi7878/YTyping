import { Text } from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

interface DateDistanceTextProps {
  date: Date;
  text?: string;
  addSuffix?: boolean;
}

const DateDistanceText = ({ date, text, addSuffix = true }: DateDistanceTextProps) => {
  return (
    <Text
      as="time"
      dateTime={date.toISOString()}
      title={date.toLocaleString("ja-JP")}
      isTruncated
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {formatDistanceToNowStrict(new Date(date), { addSuffix, locale: ja })}
      {text && text}
    </Text>
  );
};

export default DateDistanceText;
