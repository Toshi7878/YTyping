import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { useTranslations } from "next-intl";
import type React from "react";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { filterWordSymbol } from "@/app/edit/_feature/tabs/editor/filter-word-symbol";
import { sanitizeToAllowedSymbols } from "@/app/edit/_feature/utils/filter-word";
import { confirmDialog } from "@/ui/confirm-dialog";
import { FilterIconButton } from "@/ui/icon-button";
import { Textarea } from "@/ui/textarea";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { normalizeFullWidthAlnum, normalizeSymbols } from "@/utils/string";
import { dispatchEditHistory, getMapEditHistory } from "../../map-table/history";
import { setRawMapAction } from "../../map-table/map-reducer";
import { getDirectEditingIndex } from "../../map-table/map-table";
import { store } from "../../provider";
import { YTPlayer } from "../../youtube-player";
import { wordConvertAction } from "./button/word-convert";
import { dispatchLine, getSelectLine, setWord } from "./line-input";

const manyPhraseTextAtom = atom("");

export const getManyPhraseText = () => store.get(manyPhraseTextAtom);
export const setManyPhraseText = (value: ExtractAtomValue<typeof manyPhraseTextAtom>) =>
  store.set(manyPhraseTextAtom, value);

export const ManyPhraseTextarea = () => {
  const t = useTranslations("editorTab");
  const manyPhrase = useAtomValue(manyPhraseTextAtom, { store });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useHotkeys(
    "tab",
    () => {
      if (isDialogOpen()) return;

      const textarea = textareaRef.current;

      if (textarea) {
        if (document.activeElement === textarea) {
          textarea.blur();
        } else {
          textarea.focus();
          textarea.scrollTop = 0;
          textarea.setSelectionRange(0, 0);
        }
      }
    },
    { preventDefault: true, enableOnFormTags: true },
  );

  useHotkeys(
    "q",
    () => {
      if (isDialogOpen()) return;

      const topPhrase = manyPhrase.split("\n")[0] ?? "";
      void pickupTopPhrase(topPhrase);
    },
    { enableOnFormTags: ["slider"], preventDefault: true },
  );

  const { debounce } = useDebounce(500);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { lyrics } = getSelectLine();

    const topPhrase = e.target.value.split("\n")[0] ?? "";
    if (topPhrase !== lyrics) {
      debounce(() => void pickupTopPhrase(topPhrase.trim()));
    }

    setManyPhraseText(e.target.value);
  };

  const onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;

    if (!target.value) {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.scrollTop = 0;
          document.activeElement.blur();
        }
      });
    }

    const topPhrase = target.value.split("\n")[0] ?? "";

    void pickupTopPhrase(topPhrase);
  };

  return (
    <div className="relative flex items-center">
      <Textarea
        placeholder={t("manyPlaceholder")}
        id="many_phrase_textarea"
        className="h-[110px]"
        value={manyPhrase}
        onPaste={onPaste}
        onChange={onChange}
        ref={textareaRef}
      />
      <FilterSymbolButton manyPhrase={manyPhrase} />
    </div>
  );
};

interface FilterSymbolButtonProps {
  manyPhrase: string;
}

const FilterSymbolButton = ({ manyPhrase }: FilterSymbolButtonProps) => {
  const t = useTranslations("editorTab");
  const handleConfirm = async () => {
    const isConfirmed = await confirmDialog.warning({
      title: t("removeSymbolsTitle"),
      description: t("removeSymbolsDescription"),
      confirmLabel: t("removeSymbolsConfirm"),
    });

    if (!isConfirmed) return;

    const cleanedText = sanitizeToAllowedSymbols(
      filterWordSymbol({
        sentence: normalizeSymbols(normalizeFullWidthAlnum(manyPhrase)),
        filterType: "lyricsWithFilterSymbol",
        replaceChar: " ",
      }),
    )
      .replace(/ {2,}/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    setManyPhraseText(cleanedText);

    const topPhrase = cleanedText.split("\n")[0] ?? "";
    void pickupTopPhrase(topPhrase);
    toast.success(t("removeSymbolsDone"), {
      description: t("removeSymbolsDoneDescription"),
    });
  };

  return (
    <TooltipWrapper
      label={
        <>
          <div>{t("removeSymbolsTooltip1")}</div>
          <div>{t("removeSymbolsTooltip2")}</div>
        </>
      }
      asChild
    >
      <FilterIconButton disabled={!manyPhrase} onClick={handleConfirm} className="absolute right-5 bottom-2 size-8" />
    </TooltipWrapper>
  );
};

export const pickupTopPhrase = async (topPhrase: string) => {
  const directEditingIndex = getDirectEditingIndex();
  if (directEditingIndex !== null) return null;

  dispatchLine({
    type: "set",
    line: { lyrics: topPhrase.trim(), word: "", selectIndex: null, time: YTPlayer.getCurrentTime() ?? 0 },
  });

  const word = await wordConvertAction(topPhrase);

  const { lyrics } = getSelectLine();

  if (lyrics === topPhrase) {
    setWord(word);
    return;
  }

  const { present } = getMapEditHistory();
  if (present) {
    const { actionType, data } = present;
    if (actionType === "add") {
      if (data.lyrics === topPhrase) {
        const { lineIndex, ...line } = present.data;
        const newLine = { ...line, word };
        setRawMapAction({ type: "update", payload: newLine, index: lineIndex });
        dispatchEditHistory({ type: "overwrite", payload: { ...present, data: { ...present.data, word } } });
        return;
      }
    }
  }
};

export const deleteTopPhrase = (lyrics: string) => {
  const manyPhraseText = getManyPhraseText();
  const lines = manyPhraseText.split("\n") || [];

  if (lyrics === lines[0]?.trim()) {
    const newManyPhrase = lines.slice(1).join("\n");

    setManyPhraseText(newManyPhrase);
    setTimeout(() => {
      const textarea = document.getElementById("many_phrase_textarea");
      if (textarea) {
        textarea.scrollTop = 0;
      }
    });
  }
};
