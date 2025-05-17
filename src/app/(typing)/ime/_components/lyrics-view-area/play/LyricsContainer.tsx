import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLyricsContainer } from "../../../atom/refAtoms";
import { useCountState, useDisplayLinesState, useMapState, useNextDisplayLineState } from "../../../atom/stateAtoms";
import { COMPLETED_WIPE_COLOR, INITIAL_WIPE_COLOR } from "../../../ts/const";
import "./lyrics-container.css";
import Skip from "./Skip";

const LyricsContainer = (props: FlexProps) => {
  return (
    <Flex id="lyrics-container" position="relative" flexDirection="column" mb={2} {...props}>
      <Lyrics />
      <NextLyrics />
      <Skip position="absolute" bottom={0.5} left={-24} />
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
    <Box my={1} ref={lyricsContainerRef} minH="7.5rem">
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

const NextLyrics = () => {
  const nextDisplayLine = useNextDisplayLineState();
  const map = useMapState();
  const count = useCountState();

  const nextLine = map?.lines?.[count];
  return (
    <Box id="next_lyrics" color="#aaa" fontSize="60%">
      {nextLine && <Text as="span">{`NEXT: `}</Text>}
      <AnimatePresence>
        {nextDisplayLine.length > 0 && (
          <motion.div
            key="next-lyrics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: "inline" }}
          >
            {nextDisplayLine.map((chunk) => (
              <>
                <Text as="span" key={String(chunk.time)}>
                  {chunk.word}
                </Text>{" "}
              </>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default LyricsContainer;
