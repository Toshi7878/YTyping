import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { RouterOutPuts } from "@/server/api/trpc";

interface ResultToolTipTextProps {
  typeCounts: RouterOutPuts["result"]["getMapRanking"][number]["typeCounts"];
  otherStatus: RouterOutPuts["result"]["getMapRanking"][number]["otherStatus"];
  typeSpeed: RouterOutPuts["result"]["getMapRanking"][number]["typeSpeed"];
  missRate: string;
  isPerfect: boolean;
  isKanaFlickTyped: boolean;
  updatedAt: Date;
}

export const ResultToolTipText = ({
  typeCounts,
  otherStatus,
  isPerfect,
  missRate,
  typeSpeed,
  isKanaFlickTyped,
  updatedAt,
}: ResultToolTipTextProps) => {
  const { miss, lost, maxCombo, playSpeed } = otherStatus;
  const { kpm, rkpm, kanaToRomaKpm, kanaToRomaRkpm } = typeSpeed;

  return (
    <div className="min-w-36 space-y-3 p-4 text-xs md:min-w-48 md:text-base">
      <TypeCountResult typeCounts={typeCounts} />

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>ミス数</span>
          <span>
            {miss} <span>({missRate}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>ロスト数</span>
          <span>{lost}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>最大コンボ</span>
          <span className={cn(isPerfect && "text-perfect outline-text")}>{maxCombo}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>rkpm</span>
          <span>{rkpm}</span>
        </div>

        {isKanaFlickTyped && kpm !== kanaToRomaKpm && (
          <div className="flex flex-col items-center justify-between md:flex-row">
            <span>ローマ字換算kpm: </span>
            <span>
              {kanaToRomaKpm}
              {kanaToRomaRkpm && <span>(rkpm:{kanaToRomaRkpm})</span>}
            </span>
          </div>
        )}

        {playSpeed > 1 && (
          <div className="flex items-center justify-between">
            <span>倍速</span>
            <span>{playSpeed.toFixed(2)}x</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span>日時</span>
          <span>
            {new Date(updatedAt).toLocaleString("ja-JP", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

interface TypeCountResultProps {
  typeCounts: RouterOutPuts["result"]["getMapRanking"][number]["typeCounts"];
}

export const TypeCountResult = ({ typeCounts }: TypeCountResultProps) => {
  const { romaType, kanaType, flickType, englishType, numType, spaceType, symbolType } = typeCounts;
  const types = [
    { label: "ローマ字", value: romaType },
    { label: "かな入力", value: kanaType },
    { label: "フリック", value: flickType },
    {
      label: "英数字記号",
      value: englishType + numType + symbolType + spaceType,
    },
  ];

  const total = types.reduce((sum, type) => sum + type.value, 0);
  const typesUsedCount = types.filter((type) => type.value > 0).length;

  return (
    <div className="space-y-1">
      {types.map(
        (type) =>
          type.value > 0 && (
            <div key={type.label} className="flex items-center justify-between">
              <span>{type.label}</span>
              <span>{type.value}</span>
            </div>
          ),
      )}
      {typesUsedCount > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span>合計</span>
          <span>{total}</span>
        </div>
      )}
    </div>
  );
};
