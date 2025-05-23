import { useLyricsState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Flex } from "@chakra-ui/react";
import parse from "html-react-parser";

const Lyrics = () => {
  const lyrics = useLyricsState();
  const userOptionsAtom = useUserTypingOptionsState();

  return (
    <Flex
      fontWeight="bold"
      fontSize={{ base: "5rem", sm: "4rem", md: "2.75rem" }}
      id="lyrics"
      alignItems="flex-end"
      ml={1}
      width="103%"
      className="lyrics-font"
      whiteSpace="nowrap"
      sx={{
        ...(userOptionsAtom.line_completed_display === "NEXT_WORD" && {
          ".word-area-completed + &": {
            visibility: "hidden",
          },
        }),
      }}
    >
      {parse(lyrics)}
      <ruby className="invisible">
        あ<rt>あ</rt>
      </ruby>
    </Flex>
  );
};

export default Lyrics;
