import { useNextLyricsState } from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Box, Flex, useTheme } from "@chakra-ui/react";
import parse from "html-react-parser";

const NextLyrics = () => {
  const theme: ThemeColors = useTheme();
  const { lyrics, kpm } = useNextLyricsState();

  return (
    <Flex
      color={`${theme.colors.text.body}`}
      id="next_lyrics_kpm"
      opacity={0.6}
      alignItems="flex-end"
      whiteSpace="nowrap"
      fontSize={{ base: "4rem", sm: "2.7rem", md: "3xl" }}
      className="lyrics-font"
      lineHeight={{ base: "80px", sm: "50px", md: "2.5rem" }}
    >
      <Box ml={1.5} fontWeight="bold" id="next_lyrics" whiteSpace="nowrap">
        {parse(lyrics)}
        <ruby className="invisible">
          あ<rt>あ</rt>
        </ruby>
      </Box>
      <Box ml={2} id="next_kpm">
        {Number(kpm) > 0 ? `NEXT: ${kpm}kpm` : ""}
      </Box>
    </Flex>
  );
};

export default NextLyrics;
