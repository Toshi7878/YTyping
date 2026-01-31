import type React from "react";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TiFilter } from "react-icons/ti";
import { toast } from "sonner";
import { readSelectLine, setManyPhrase, useManyPhraseState } from "@/app/edit/_lib/atoms/state";
import { pickupTopPhrase } from "@/app/edit/_lib/editor/many-phrase";
import { filterWordSymbol } from "@/app/edit/_lib/editor/typable-word-convert";
import { sanitizeToAllowedSymbols } from "@/app/edit/_lib/utils/filter-word";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { normalizeFullWidthAlnum, normalizeSymbols } from "@/utils/string-transform";

export const ManyPhraseTextarea = () => {
  const manyPhrase = useManyPhraseState();
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
    const { lyrics } = readSelectLine();

    const topPhrase = e.target.value.split("\n")[0] ?? "";
    if (topPhrase !== lyrics) {
      debounce(() => void pickupTopPhrase(topPhrase.trim()));
    }

    setManyPhrase(e.target.value);
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
        placeholder={`ここから歌詞をまとめて追加できます。
Sキー: 歌詞を追加
Ctrl+Zキー: 歌詞追加のやり直し`}
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
  const confirm = useConfirm();

  const handleConfirm = async () => {
    const isConfirmed = await confirm({
      title: "記号を削除",
      description:
        "歌詞追加テキストエリアから読み変換で変換されない記号を削除します。この操作は元に戻せません。続行しますか？",
      actionButton: "削除する",
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

    setManyPhrase(cleanedText);

    const topPhrase = cleanedText.split("\n")[0] ?? "";
    void pickupTopPhrase(topPhrase);
    toast.success("歌詞追加テキストエリアの記号を削除しました", {
      description: "読み変換で変換されない記号を削除しました",
    });
  };

  return (
    <TooltipWrapper
      label={
        <>
          <div>読み変換で変換されない記号を削除します。</div>
          <div>※設定タブ内の読み変換設定によって削除される記号は変化します。</div>
        </>
      }
    >
      <Button
        aria-label="記号を削除"
        size="sm"
        variant="outline"
        className="absolute right-5 bottom-2"
        disabled={!manyPhrase}
        onClick={handleConfirm}
        tabIndex={-1}
      >
        <TiFilter size="18px" />
      </Button>
    </TooltipWrapper>
  );
};
