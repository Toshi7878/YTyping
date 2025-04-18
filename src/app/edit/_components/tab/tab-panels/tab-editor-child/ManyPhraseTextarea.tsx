import { useLineStateRef, useManyPhraseState, useSetManyPhraseState } from "@/app/edit/atoms/stateAtoms";
import { usePickupTopPhrase } from "@/app/edit/hooks/manyPhrase";
import { useFilterWordSymbol, useLyricsFormatUtils } from "@/app/edit/hooks/utils/useWordConverter";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  IconButton,
  Textarea,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import { useRef } from "react";
import { TiFilter } from "react-icons/ti";

const ManyPhraseTextarea = () => {
  const theme: ThemeColors = useTheme();
  const manyPhrase = useManyPhraseState();

  const setManyPhrase = useSetManyPhraseState();
  const pickupTopPhrase = usePickupTopPhrase();
  const readSelectLine = useLineStateRef();

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { lyrics } = readSelectLine();

    const topPhrase = e.target.value.split("\n")[0];
    if (topPhrase !== lyrics) {
      pickupTopPhrase(topPhrase);
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
    <Box display="flex" alignItems="center" position="relative">
      <Textarea
        placeholder={`ここから歌詞をまとめて追加できます。
Sキー: 歌詞を追加
Ctrl+Zキー: 歌詞追加のやり直し`}
        size="lg"
        id="many_phrase_textarea"
        height="110px"
        value={manyPhrase}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}80`}
        _focus={{
          borderColor: `${theme.colors.primary}`,
        }}
        onPaste={onPaste}
        onChange={onChange}
      />
      <FilterSymbolButton manyPhrase={manyPhrase} />
    </Box>
  );
};

interface FilterSymbolButtonProps {
  manyPhrase: string;
}
const FilterSymbolButton = ({ manyPhrase }: FilterSymbolButtonProps) => {
  const setManyPhrase = useSetManyPhraseState();
  const pickupTopPhrase = usePickupTopPhrase();
  const filterWordSymbol = useFilterWordSymbol();
  const { formatSimilarChar, filterUnicodeSymbol } = useLyricsFormatUtils();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useCustomToast();

  const removeSymbols = () => {
    if (!manyPhrase) return;
    onOpen();
  };

  const handleConfirm = () => {
    const cleanedText = filterUnicodeSymbol(
      filterWordSymbol({
        sentence: formatSimilarChar(manyPhrase),
        filterType: "lyricsWithFilterSymbol",
        replaceChar: " ",
      })
    )
      .replace(/ {2,}/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    setManyPhrase(cleanedText);

    const topPhrase = cleanedText.split("\n")[0];
    pickupTopPhrase(topPhrase);
    onClose();
    toast({
      title: "歌詞追加テキストエリアの記号を削除しました",
      message: "読み変換で変換されない記号を削除しました",
      type: "success",
    });
  };

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <CustomToolTip
        label={
          <>
            <Box>読み変換で変換されない記号を削除します。</Box>
            <Box>※設定タブ内の読み変換設定によって削除される記号は変化します。</Box>
          </>
        }
        placement="top"
      >
        <IconButton
          aria-label="記号を削除"
          icon={<TiFilter size="18px" />}
          position="absolute"
          right="20px"
          bottom="8px"
          size="sm"
          colorScheme="gray"
          variant="outline"
          onClick={removeSymbols}
          isDisabled={!manyPhrase}
        />
      </CustomToolTip>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              記号を削除
            </AlertDialogHeader>

            <AlertDialogBody>
              歌詞追加テキストエリアから読み変換で変換されない記号を削除します。この操作は元に戻せません。続行しますか？
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose}>キャンセル</Button>
              <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                削除する
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ManyPhraseTextarea;
