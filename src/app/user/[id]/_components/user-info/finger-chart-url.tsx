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
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-light hover:text-primary-light/80 flex flex-row items-center gap-1 transition-colors hover:underline"
      >
        <span>運指表を見る</span>
        <FiExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
};

export default FingerChartUrl;
