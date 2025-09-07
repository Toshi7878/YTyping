import TextLink from "@/components/ui/text-link";
import { FiExternalLink } from "react-icons/fi";

interface FingerChartUrlProps {
  url: string;
}

const FingerChartUrl = ({ url }: FingerChartUrlProps) => {
  if (!url) {
    return <p>運指表はありません</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">運指表:</span>
      <TextLink href={url} target="_blank" rel="noopener noreferrer">
        <span>運指表を見る</span>
        <FiExternalLink className="h-4 w-4" />
      </TextLink>
    </div>
  );
};

export default FingerChartUrl;
