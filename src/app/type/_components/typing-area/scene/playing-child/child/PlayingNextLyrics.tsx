import { useNextLyricsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";

const NextLyrics = () => {
  const theme: ThemeColors = useTheme();
  const { lyrics, kpm } = useNextLyricsAtom();

  return (
    <Box
      color={`${theme.colors.text.body}`}
      id="next_lyrics_kpm"
      opacity={0.6}
      fontSize="3xl"
      className="lyrics-font"
      lineHeight={10}
      ml={-2}
    >
      <Box
        fontWeight="bold"
        id="next_lyrics"
        className="-indent-3"
        dangerouslySetInnerHTML={{
          __html: `<ruby class="invisible">あ<rt>あ<rt></ruby>${lyrics}`,
        }}
      />
      <Box id="next_kpm" ml={3.5}>
        {Number(kpm) > 0 ? `NEXT: ${kpm}kpm` : ""}
      </Box>
    </Box>
  );
};

export default NextLyrics;
