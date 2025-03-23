import { useLineStateRef, useManyPhraseState, useSetManyPhraseState } from "@/app/edit/atoms/stateAtoms";
import { usePickupTopPhrase } from "@/app/edit/hooks/manyPhrase";
import { ThemeColors } from "@/types";
import { Box, Textarea, useTheme } from "@chakra-ui/react";

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

  const onPaste = async () => {
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.scrollTop = 0;
        document.activeElement.blur();
      }
    });

    const pasteManyPhrase = await navigator.clipboard.readText();
    const lines = pasteManyPhrase.split(/\r\n|\n/) || [];

    const topPhrase = lines[0];

    pickupTopPhrase(topPhrase);
  };

  return (
    <Box display="flex" alignItems="center">
      <Textarea
        placeholder="ここから歌詞をまとめて追加できます"
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
    </Box>
  );
};

export default ManyPhraseTextarea;
