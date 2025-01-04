import { ResultCardInfo } from "@/app/timeline/ts/type";
import { ThemeColors } from "@/types";
import { CardBody, useTheme } from "@chakra-ui/react";

interface ResultInnerCardBodyWrapperProps {
  children: React.ReactNode;
  result?: ResultCardInfo;
}
const ResultInnerCardBodyWrapper = ({ children, result }: ResultInnerCardBodyWrapperProps) => {
  const theme: ThemeColors = useTheme();

  const src =
    result?.map.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result?.map.videoId}/mqdefault.jpg`;

  return (
    <CardBody
      bg={
        !result
          ? theme.colors.background.body
          : `linear-gradient(to right, ${theme.colors.background.body}, ${theme.colors.background.body}dd), url(${src})`
      } // 画像のみに黒いオーバーレイを追加
      bgSize="cover"
      bgPosition="center"
      borderRadius="lg"
      className="flex items-start"
      style={{ padding: 0 }}
      mx={6}
    >
      {children}
    </CardBody>
  );
};
export default ResultInnerCardBodyWrapper;
