import { Text } from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

interface UpdateAtTextProps {
  updatedAt: Date;
}

const UpdateAtText = (props: UpdateAtTextProps) => {
  const date = new Date(props.updatedAt);

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
      {formatDistanceToNowStrict(new Date(props.updatedAt), { addSuffix: true, locale: ja })}
    </Text>
  );
};

export default UpdateAtText;
