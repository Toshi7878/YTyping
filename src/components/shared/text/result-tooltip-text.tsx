import { Separator } from "@/components/ui/separator";
import type { RouterOutputs } from "@/server/api/trpc";

interface ResultToolTipTextProps {
  typeCounts: RouterOutputs["result"]["getMapRanking"][number]["typeCounts"];
  otherStatus: RouterOutputs["result"]["getMapRanking"][number]["otherStatus"];
  typeSpeed: RouterOutputs["result"]["getMapRanking"][number]["typeSpeed"];
  missRate: string;
  isKanaFlickTyped: boolean;
  updatedAt: Date;
}

export const ResultToolTipText = ({
  typeCounts,
  otherStatus,
  missRate,
  typeSpeed,
  isKanaFlickTyped,
  updatedAt,
}: ResultToolTipTextProps) => {
  const { miss, lost, maxCombo, playSpeed, isCaseSensitive } = otherStatus;
  const { kpm, rkpm, kanaToRomaKpm, kanaToRomaRkpm } = typeSpeed;

  return (
    <div className="min-w-32 space-y-1 p-1 text-xs md:min-w-48 md:text-base">
      <TypeCountResult typeCounts={typeCounts} />
      <Separator className="my-3" />

      <LabelValue label="ミス数" value={`${miss} (${missRate}%)`} />
      <LabelValue label="ロスト数" value={lost} />
      <LabelValue label="最大コンボ" value={maxCombo} />
      <LabelValue label="rkpm" value={rkpm} />

      {isKanaFlickTyped && kpm !== kanaToRomaKpm && (
        <>
          <LabelValue label="ﾛﾏ換算kpm" value={kanaToRomaKpm} />
          {kanaToRomaRkpm > 0 && <LabelValue label="ﾛﾏ換算rkpm" value={kanaToRomaRkpm} />}
        </>
      )}

      {playSpeed > 1 && <LabelValue label="倍速" value={playSpeed.toFixed(2)} />}
      {isCaseSensitive && <LabelValue label="英語大文字" value="有効" />}

      <LabelValue
        label="日時"
        value={new Date(updatedAt).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      />
    </div>
  );
};

interface TypeCountResultProps {
  typeCounts: RouterOutputs["result"]["getMapRanking"][number]["typeCounts"];
}

const TypeCountResult = ({ typeCounts }: TypeCountResultProps) => {
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

  const hasMultipleTypes = typesUsedCount > 1;
  const totalLabel = hasMultipleTypes ? "合計打数" : "打数";
  return (
    <div className="space-y-2">
      {hasMultipleTypes &&
        types.map((type) => type.value > 0 && <LabelValue key={type.label} label={type.label} value={type.value} />)}
      {<LabelValue label={totalLabel} value={total} />}
    </div>
  );
};

const LabelValue = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
};
