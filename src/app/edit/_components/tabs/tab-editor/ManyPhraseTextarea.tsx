import { useManyPhraseState, useReadLine, useSetManyPhrase } from "@/app/edit/_lib/atoms/stateAtoms";
import { usePickupTopPhrase } from "@/app/edit/_lib/hooks/manyPhrase";
import { useFilterWordSymbol, useLyricsFormatUtils } from "@/app/edit/_lib/hooks/useWordConverter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { useState } from "react";
import { TiFilter } from "react-icons/ti";

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
        className="h-[110px] resize-none"
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
  const [isOpen, setIsOpen] = useState(false);
  const toast = useCustomToast();

  const handleConfirm = () => {
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
    setIsOpen(false);
    toast({
      title: "歌詞追加テキストエリアの記号を削除しました",
      message: "読み変換で変換されない記号を削除しました",
      type: "success",
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
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              aria-label="記号を削除"
              size="sm"
              variant="outline"
              className="absolute right-5 bottom-2"
              disabled={!manyPhrase}
            >
              <TiFilter size="18px" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>記号を削除</AlertDialogTitle>
              <AlertDialogDescription>
                歌詞追加テキストエリアから読み変換で変換されない記号を削除します。この操作は元に戻せません。続行しますか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>削除する</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipWrapper>
    </>
  );
};

export default ManyPhraseTextarea;
