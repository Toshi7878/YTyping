import { useLyricsAtom, useUserOptionsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";
import parse from "html-react-parser";

const PlayingLyrics = () => {
  const lyrics = useLyricsAtom();
  const userOptionsAtom = useUserOptionsAtom();

  return (
    <Box
      fontWeight="bold"
      fontSize={{ base: "5rem", sm: "4rem", md: "2.75rem" }}
      id="lyrics"
      ml={1}
      width="103%"
      className={"lyrics-font"}
      whiteSpace="nowrap"
      {...(userOptionsAtom.line_completed_display === "NEXT_WORD" && {
        sx: {
          ".word-area-completed + &": {
            visibility: "hidden",
          },
        },
      })}
    >
      {parse(`${lyrics}<ruby class="invisible">あ<rt>あ<rt></ruby>`)}
    </Box>
  );
};

export default PlayingLyrics;
