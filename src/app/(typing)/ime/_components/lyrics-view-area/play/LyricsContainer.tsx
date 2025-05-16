import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useLyricsContainer } from "../../../atom/refAtoms";
import { useDisplayLinesState } from "../../../atom/stateAtoms";
import { COMPLETED_WIPE_COLOR, INITIAL_WIPE_COLOR } from "../../../ts/const";
import "./lyrics-container.css";

const LyricsContainer = () => {
  return (
    <Flex id="lyrics-container" ml={32} flexDirection="column" mb={2}>
      <Lyrics />
      <Box id="next_lyrics" color="#aaa" fontSize="60%">
        NEXT: test
      </Box>
    </Flex>
  );
};

const Lyrics = () => {
  const { writeLyricsContainer } = useLyricsContainer();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const displayLines = useDisplayLinesState();

  useEffect(() => {
    if (lyricsContainerRef.current) {
      writeLyricsContainer(lyricsContainerRef.current);
    }
  }, [writeLyricsContainer]);

  return (
    <Box id="lyrics" my={1} ref={lyricsContainerRef} minH="7.5rem">
      {displayLines.map((line, index) => (
        <Box key={index}>
          <Box className="shadow-layer">
            {line.map((chunk) => (
              <>
                <Text as="span" key={String(chunk.time)} color="transparent">
                  {chunk.word}
                </Text>{" "}
              </>
            ))}
          </Box>
          <Box className="wipe-layer">
            {line.map((chunk) => (
              <>
                <Text
                  as="span"
                  key={String(chunk.time)}
                  style={index === displayLines.length - 1 ? INITIAL_WIPE_COLOR : COMPLETED_WIPE_COLOR}
                >
                  {chunk.word}
                </Text>{" "}
              </>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default LyricsContainer;
