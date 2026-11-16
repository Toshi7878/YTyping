"use client";
import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useTranslations } from "next-intl";
import { store } from "@/app/edit/_feature/provider";
import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/app/edit/_feature/utils/const";
import { Label } from "@/ui/label";
import { RadioButton, RadioGroup } from "@/ui/radio-group/radio-group";
import { TooltipWrapper } from "@/ui/tooltip";

const wordConvertOptionAtom = atomWithStorage<"non_symbol" | "add_symbol" | "add_symbol_all">(
  "edit-word-convert-option",
  "non_symbol",
  undefined,
  { getOnInit: true },
);
export type WordConvertOption = ExtractAtomValue<typeof wordConvertOptionAtom>;

export const useWordConvertOption = () => useAtomValue(wordConvertOptionAtom, { store });
export const setWordConvertOption = (value: ExtractAtomValue<typeof wordConvertOptionAtom>) =>
  store.set(wordConvertOptionAtom, value);
export const getWordConvertOption = () => store.get(wordConvertOptionAtom);

const CONVERT_OPTIONS = [
  {
    value: "non_symbol",
    labelKey: "noSymbol",
    activeVariant: "success",
    inactiveVariant: "outline-success",
    descriptionKey: "noSymbolDescription",
    symbolList: MANDATORY_SYMBOL_LIST,
  },
  {
    value: "add_symbol",
    labelKey: "someSymbol",
    activeVariant: "warning",
    inactiveVariant: "outline-warning",
    descriptionKey: "someSymbolDescription",
    symbolList: [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST],
  },
  {
    value: "add_symbol_all",
    labelKey: "allSymbol",
    activeVariant: "destructive",
    inactiveVariant: "outline-destructive",
    descriptionKey: "allSymbolDescription",
    symbolList: [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST],
  },
] as const;

export const ConvertOptionButtons = () => {
  const t = useTranslations("editorSettings.convert");
  const wordConvertOption = useWordConvertOption();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
      <Label className="whitespace-nowrap text-sm">{t("title")}</Label>
      <RadioGroup
        value={wordConvertOption}
        onValueChange={(value) => setWordConvertOption(value as WordConvertOption)}
        className="flex flex-col gap-2 sm:flex-row"
      >
        {CONVERT_OPTIONS.map((option) => (
          <ConvertOptionButton key={option.value} option={option} isActive={wordConvertOption === option.value} />
        ))}
      </RadioGroup>
    </div>
  );
};

const ConvertOptionButton = ({ option, isActive }: { option: (typeof CONVERT_OPTIONS)[number]; isActive: boolean }) => {
  const t = useTranslations("editorSettings.convert");

  return (
    <TooltipWrapper
      key={option.value}
      label={
        <div>
          <div>{t(option.descriptionKey)}</div>
          <div>{t("symbols", { symbols: option.symbolList.join(" ") })}</div>
        </div>
      }
      side="bottom"
      asChild
    >
      <RadioButton
        value={option.value}
        className="h-10 w-full text-xs sm:h-[50px] sm:w-[120px] sm:text-sm md:w-[150px]"
        variant={isActive ? option.activeVariant : option.inactiveVariant}
      >
        {t(option.labelKey)}
      </RadioButton>
    </TooltipWrapper>
  );
};
