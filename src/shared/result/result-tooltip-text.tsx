import { useLocale, useTranslations } from "next-intl";
import type { RouterOutputs } from "@/server/api/root";
import { Separator } from "@/ui/separator";

interface ResultToolTipTextProps {
  typeCounts: RouterOutputs["result"]["ranking"]["get"][number]["typeCounts"];
  otherStatus: RouterOutputs["result"]["ranking"]["get"][number]["otherStatus"];
  typeSpeed: RouterOutputs["result"]["ranking"]["get"][number]["typeSpeed"];
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
  const t = useTranslations("result.tooltip");
  const locale = useLocale();
  const { miss, lost, maxCombo, playSpeed, isCaseSensitive } = otherStatus;
  const { kpm, rkpm, kanaToRomaKpm, kanaToRomaRkpm } = typeSpeed;

  return (
    <div className="min-w-32 space-y-1 p-1 text-xs md:min-w-48 md:text-base">
      <TypeCountResult typeCounts={typeCounts} />
      <Separator className="my-3" />

      <LabelValue label={t("miss")} value={`${miss} (${missRate}%)`} />
      <LabelValue label={t("lost")} value={lost} />
      <LabelValue label={t("maxCombo")} value={maxCombo} />
      <LabelValue label="rkpm" value={rkpm} />

      {isKanaFlickTyped && kpm !== kanaToRomaKpm && (
        <>
          <LabelValue label={t("kanaToRomaKpm")} value={kanaToRomaKpm} />
          {kanaToRomaRkpm > 0 && <LabelValue label={t("kanaToRomaRkpm")} value={kanaToRomaRkpm} />}
        </>
      )}

      {playSpeed > 1 && <LabelValue label={t("speed")} value={playSpeed.toFixed(2)} />}
      {isCaseSensitive && <LabelValue label={t("caseSensitive")} value={t("enabled")} />}
      <LabelValue label="pp" value={otherStatus.pp.toFixed(2)} />
      <LabelValue
        label={t("date")}
        value={new Date(updatedAt).toLocaleString(locale === "en" ? "en-US" : "ja-JP", {
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
  typeCounts: RouterOutputs["result"]["ranking"]["get"][number]["typeCounts"];
}

const TypeCountResult = ({ typeCounts }: TypeCountResultProps) => {
  const t = useTranslations("result.tooltip");
  const { romaType, kanaType, flickType, englishType, numType, spaceType, symbolType } = typeCounts;
  const types = [
    { label: t("romaTypes"), value: romaType },
    { label: t("kanaTypes"), value: kanaType },
    { label: t("flickTypes"), value: flickType },
    {
      label: t("otherTypes"),
      value: englishType + numType + symbolType + spaceType,
    },
  ];

  const total = types.reduce((sum, type) => sum + type.value, 0);
  const typesUsedCount = types.filter((type) => type.value > 0).length;

  const hasMultipleTypes = typesUsedCount > 1;
  const totalLabel = hasMultipleTypes ? t("totalTypes") : t("types");
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
