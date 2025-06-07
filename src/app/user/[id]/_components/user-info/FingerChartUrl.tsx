import Link from "next/link";
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
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
      >
        <span>運指表を見る</span>
        <FiExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default FingerChartUrl;
