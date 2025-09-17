import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ResultToolTipTextProps {
  romaType: number;
  kanaType: number;
  flickType: number;
  englishType: number;
  numType: number;
  spaceType: number;
  symbolType: number;
  miss: number;
  correctRate: string;
  lost: number;
  isPerfect: boolean;
  maxCombo: number;
  kpm: number;
  rkpm: number;
  kanaToRomaConvertKpm: number;
  kanaToRomaConvertRkpm: number;
  isKanaFlickTyped: boolean;
  defaultSpeed: number;
  updatedAt: Date;
}

const ResultToolTipText = ({
  romaType,
  kanaType,
  flickType,
  englishType,
  numType,
  spaceType,
  symbolType,
  miss,
  correctRate,
  lost,
  isPerfect,
  maxCombo,
  kpm,
  rkpm,
  kanaToRomaConvertKpm,
  kanaToRomaConvertRkpm,
  isKanaFlickTyped,
  defaultSpeed,
  updatedAt,
}: ResultToolTipTextProps) => {
  return (
    <div className="p-4">
      <div className="flex flex-col items-start gap-3">
        <TypeCountResult
          romaType={romaType}
          kanaType={kanaType}
          flickType={flickType}
          englishType={englishType}
          numType={numType}
          symbolType={symbolType}
          spaceType={spaceType}
        />
        <Separator />
        <div className="flex gap-2">
          <span>ミス数:</span>
          <span className="text-base font-bold">
            {miss} ({correctRate}%)
          </span>
        </div>

        <div className="flex gap-2">
          <span>ロスト数:</span>
          <span className="text-base font-bold">{lost}</span>
        </div>

        <div className="flex gap-2">
          <span>最大コンボ:</span>
          <span className={cn("text-base font-bold", isPerfect && ["text-perfect", "outline-text"])}>{maxCombo}</span>
        </div>

        <div className="flex gap-2">
          <span>rkpm:</span>
          <span className="text-base font-bold">{rkpm}</span>
        </div>

        {isKanaFlickTyped && kpm !== kanaToRomaConvertKpm && (
          <div className="flex gap-2">
            <span>ローマ字換算kpm:</span>
            <span className="text-base font-bold">
              {kanaToRomaConvertKpm} {kanaToRomaConvertRkpm ? `(rkpm:${kanaToRomaConvertRkpm})` : ""}
            </span>
          </div>
        )}

        {defaultSpeed > 1 && (
          <div className="flex gap-2">
            <span>倍速:</span>
            <span className="text-base font-bold">{defaultSpeed.toFixed(2)}x</span>
          </div>
        )}

        <div className="flex gap-2">
          <span>日時:</span>
          <span className="text-base">
            {new Date(updatedAt).toLocaleString("ja-JP", {
              year: "numeric",
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
  romaType: number;
  kanaType: number;
  flickType: number;
  englishType: number;
  numType: number;
  spaceType: number;
  symbolType: number;
}

const TypeCountResult = ({
  romaType,
  kanaType,
  flickType,
  englishType,
  numType,
  spaceType,
  symbolType,
}: TypeCountResultProps) => {
  const types = [
    { label: "ローマ字タイプ数", value: romaType },
    { label: "かな入力タイプ数", value: kanaType },
    { label: "フリック入力タイプ数", value: flickType },
    {
      label: "英数字記号タイプ数",
      value: englishType + numType + symbolType + spaceType,
    },
  ];

  const total = types.reduce((sum, type) => sum + type.value, 0);
  const typesUsedCount = types.filter((type) => type.value > 0).length;

  return (
    <div className="flex flex-col items-start gap-1">
      {types.map(
        (type, index) =>
          type.value > 0 && (
            <div key={index} className="flex gap-2">
              <span>{type.label}:</span>
              <span className="text-base font-bold">{type.value}</span>
            </div>
          ),
      )}
      {typesUsedCount > 1 && (
        <div className="flex gap-2">
          <span>合計タイプ数:</span>
          <span className="text-base font-bold">{total}</span>
        </div>
      )}
    </div>
  );
};

export default ResultToolTipText;
