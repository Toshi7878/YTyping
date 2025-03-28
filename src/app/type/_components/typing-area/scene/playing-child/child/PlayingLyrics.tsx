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
        ...(userOptionsAtom.line_completed_display === "NEXT_WORD" && {
          ".word-area-completed + &": {
            visibility: "hidden",
          },
        }),
        "ruby, rt": {
          whiteSpace: "nowrap",
        },
      }}
    >
      {parse(`${lyrics}`)}
      <ruby className="invisible">
        あ<rt>あ</rt>
      </ruby>
    </Box>
  );
};

export default PlayingLyrics;
