import { useTranslations } from "next-intl";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import { cn } from "@/utils/cn";

interface InputModeTextProps {
  typeCounts: ResultWithMapItem["typeCounts"];
}

export const InputModeText = ({ typeCounts }: InputModeTextProps) => {
  const t = useTranslations("result.inputMode");
  const { kanaType, romaType, flickType, englishType, spaceType, numType, symbolType } = typeCounts;

  const colors = {
    roma: "text-roma",
    kana: "text-kana",
    flick: "text-flick",
    english: "text-english",
    other: "text-other",
  };

  const renderText = (label: string, colorClass: string) => (
    <span className={cn(colorClass, "input-mode-outline-text")}>{label}</span>
  );

  const total = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0);

  if (romaType && kanaType) {
    const isRomaFirst = romaType >= kanaType;
    const first = isRomaFirst
      ? { label: t("romaShort"), color: colors.roma }
      : { label: t("kana"), color: colors.kana };
    const second = isRomaFirst
      ? { label: t("kana"), color: colors.kana }
      : { label: t("romaShort"), color: colors.roma };

    return (
      <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap">
        {renderText(first.label, first.color)}
        <span className="text-muted-foreground">・</span>
        {renderText(second.label, second.color)}
      </div>
    );
  }

  const kanaInput = romaType || kanaType;
  if (kanaInput && (englishType + spaceType) / total >= 0.1) {
    const inputMode = flickType ? "flick" : romaType >= kanaType ? "roma" : "kana";
    const inputLabel = inputMode === "flick" ? t("flick") : inputMode === "roma" ? t("romaShort") : t("kana");

    return (
      <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap">
        {renderText(inputLabel, colors[inputMode])}
        <span className="text-muted-foreground">・</span>
        {renderText(t("english"), colors.english)}
      </div>
    );
  }

  // その他の入力モードを優先順位順で判定
  if (romaType) return renderText(t("roma"), colors.roma);
  if (kanaType) return renderText(t("kana"), colors.kana);
  if (flickType) return renderText(t("flick"), colors.flick);
  if (englishType) return renderText(t("english"), colors.english);
  if (numType || spaceType || symbolType) return renderText(t("other"), colors.other);

  return null;
};
