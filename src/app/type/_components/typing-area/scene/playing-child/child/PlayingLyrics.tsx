import { useLyricsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";

const PlayingLyrics = () => {
  const lyrics = useLyricsAtom();

  return (
    <Box
      fontWeight="bold"
      fontSize="2.75rem"
      id="lyrics"
      ml={-8}
      width="103%"
      className={"-inset-5 lyrics-font"}
      dangerouslySetInnerHTML={{
        __html: `<ruby class="invisible">あ<rt>あ<rt></ruby>${lyrics}`,
      }}
    />
  );
};

export default PlayingLyrics;
