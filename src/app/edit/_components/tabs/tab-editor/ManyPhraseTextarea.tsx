import { useManyPhraseState, useReadLine, useSetManyPhrase } from "@/app/edit/_lib/atoms/stateAtoms";
import { usePickupTopPhrase } from "@/app/edit/_lib/hooks/manyPhrase";
import { useFilterWordSymbol, useLyricsFormatUtils } from "@/app/edit/_lib/hooks/useWordConverter";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { TiFilter } from "react-icons/ti";
import { toast } from "sonner";

const ManyPhraseTextarea = () => {
  const manyPhrase = useManyPhraseState();

  const setManyPhrase = useSetManyPhrase();
  const pickupTopPhrase = usePickupTopPhrase();
  const readSelectLine = useReadLine();
  const { debounce } = useDebounce(500);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { lyrics } = readSelectLine();

    const topPhrase = e.target.value.split("\n")[0];
    if (topPhrase !== lyrics) {
      debounce(() => pickupTopPhrase(topPhrase));
    }

    setManyPhrase(e.target.value);
  };

  const onPaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;

    if (!target.value) {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.scrollTop = 0;
          document.activeElement.blur();
        }
      });
    }

    const topPhrase = target.value.split("\n")[0];

    pickupTopPhrase(topPhrase);
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
      />
      <FilterSymbolButton manyPhrase={manyPhrase} />
    </div>
  );
};

interface FilterSymbolButtonProps {
  manyPhrase: string;
}

const FilterSymbolButton = ({ manyPhrase }: FilterSymbolButtonProps) => {
  const setManyPhrase = useSetManyPhrase();
  const pickupTopPhrase = usePickupTopPhrase();
  const filterWordSymbol = useFilterWordSymbol();
  const { formatSimilarChar, filterUnicodeSymbol } = useLyricsFormatUtils();
  const confirm = useConfirm();

  const handleConfirm = async () => {
    const isConfirmed = await confirm({
      title: "記号を削除",
      body: "歌詞追加テキストエリアから読み変換で変換されない記号を削除します。この操作は元に戻せません。続行しますか？",
      cancelButton: "キャンセル",
      actionButton: "削除する",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning",
    });

    if (!isConfirmed) return;

    const cleanedText = filterUnicodeSymbol(
      filterWordSymbol({
        sentence: formatSimilarChar(manyPhrase),
        filterType: "lyricsWithFilterSymbol",
        replaceChar: " ",
      }),
    )
      .replace(/ {2,}/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    setManyPhrase(cleanedText);

    const topPhrase = cleanedText.split("\n")[0];
    pickupTopPhrase(topPhrase);
    toast.success("歌詞追加テキストエリアの記号を削除しました", {
      description: "読み変換で変換されない記号を削除しました",
    });
  };

  return (
    <>
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
        >
          <TiFilter size="18px" />
        </Button>
      </TooltipWrapper>
    </>
  );
};

export default ManyPhraseTextarea;
