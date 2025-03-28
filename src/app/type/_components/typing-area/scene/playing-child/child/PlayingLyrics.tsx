import { useLyricsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Box } from "@chakra-ui/react";
import parse from "html-react-parser";

const PlayingLyrics = () => {
  const lyrics = useLyricsState();
  const userOptionsAtom = useUserTypingOptionsState();

  return (
    <Box
      fontWeight="bold"
      fontSize={{ base: "5rem", sm: "4rem", md: "2.75rem" }}
      id="lyrics"
      ml={1}
      width="103%"
      className={"lyrics-font"}
      whiteSpace="nowrap"
      sx={{
        ruby: {
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          lineHeight: "normal",
        },
        rt: {
          display: "block",
          textAlign: "center",
          fontSize: "0.5em",
          lineHeight: "1",
        },
        ...(userOptionsAtom.line_completed_display === "NEXT_WORD" && {
          ".word-area-completed + &": {
            visibility: "hidden",
          },
        }),
      }}
    >
      {parse(`${lyrics}<ruby class="invisible">あ<rt>あ</rt></ruby>`)}
    </Box>
  );
};

export default PlayingLyrics;
