import { ResultCardInfo } from "@/app/timeline/ts/type";
import { CardContent } from "@/components/ui/card";

interface ResultInnerCardBodyWrapperProps {
  children: React.ReactNode;
  result?: ResultCardInfo;
}

const ResultInnerCardBodyWrapper = ({ children, result }: ResultInnerCardBodyWrapperProps) => {
  const src =
    result?.map.thumbnail_quality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.video_id}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result?.map.video_id}/mqdefault.jpg`;

  const backgroundStyle = result
    ? {
        background: `linear-gradient(to right, hsl(var(--background)), hsl(var(--background) / 0.87)), url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: "hsl(var(--background))",
      };

  return (
    <CardContent className="mx-6 flex items-start rounded-lg p-0" style={backgroundStyle}>
      {children}
    </CardContent>
  );
};

export default ResultInnerCardBodyWrapper;
