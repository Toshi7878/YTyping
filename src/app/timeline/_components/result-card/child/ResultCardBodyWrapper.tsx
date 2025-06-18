import { ResultCardInfo } from "@/app/timeline/ts/type";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultInnerCardBodyWrapperProps {
  children: React.ReactNode;
  result?: ResultCardInfo;
}

const ResultInnerCardBodyWrapper = ({ children, result }: ResultInnerCardBodyWrapperProps) => {
  const src = result
    ? result.map.thumbnail_quality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.video_id}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result.map.video_id}/mqdefault.jpg`
    : null;

  const backgroundImageStyle = src ? ({ backgroundImage: `url(${src})` } as React.CSSProperties) : {};

  return (
    <CardContent
      variant="result"
      className={cn(
        src ? "bg-cover bg-center bg-no-repeat" : "bg-background",
      )}
      style={backgroundImageStyle}
    >
      {src && <div className="from-background/95 to-background/70 absolute inset-0 bg-gradient-to-r" />}
      <div className="relative z-10">{children}</div>
    </CardContent>
  );
};

export default ResultInnerCardBodyWrapper;
