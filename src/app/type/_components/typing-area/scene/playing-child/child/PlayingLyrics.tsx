import { useLyricsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";
import parse from "html-react-parser";

const PlayingLyrics = () => {
  const lyrics = useLyricsAtom();

  return (
    <Box
      fontWeight="bold"
      fontSize={{ base: "5rem", sm: "4rem", md: "2.75rem" }}
      id="lyrics"
      ml={1}
      width="103%"
      className={"lyrics-font"}
    >
      {parse(`${lyrics}<ruby class="invisible">あ<rt>あ<rt></ruby>`)}
    </Box>
  );
};

export default PlayingLyrics;
