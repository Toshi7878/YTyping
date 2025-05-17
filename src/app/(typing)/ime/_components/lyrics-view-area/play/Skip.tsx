import { Box, BoxProps } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useLyricsTextarea, usePlayer } from "../../../atom/refAtoms";
import { useReadPlaySpeed } from "../../../atom/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useSetSkipRemainTime,
  useSkipRemainTimeState,
} from "../../../atom/stateAtoms";

const SKIP_BUFFER_TIME = 3;
const Skip = (props: BoxProps) => {
  const skipRemainTime = useSkipRemainTimeState();
  const setSkipRemainTime = useSetSkipRemainTime();
  const readMap = useReadMap();
  const { readGameUtilParams } = useReadGameUtilParams();
  const readPlaySpeed = useReadPlaySpeed();
  const { readPlayer } = usePlayer();
  const { readLyricsTextarea } = useLyricsTextarea();

  const handleClick = () => {
    if (skipRemainTime === null) return;

    const map = readMap();
    const { count } = readGameUtilParams();

    const nextLine = map.lines?.[count];

    const nextStartTime = Number(nextLine[0]["time"]);

    const { playSpeed } = readPlaySpeed();

    const seekTime = nextStartTime - SKIP_BUFFER_TIME + (SKIP_BUFFER_TIME - playSpeed);

    readPlayer().seekTo(seekTime, true);

    setSkipRemainTime(null);
    readLyricsTextarea().focus();
  };

  return (
    <AnimatePresence>
      {skipRemainTime !== null && (
        <Box
          as={motion.div}
          {...props}
          fontSize="60%"
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 } as any}
          onClick={handleClick}
          cursor="pointer"
          _hover={{
            textDecoration: "underline",
          }}
        >
          Skip ({skipRemainTime})
        </Box>
      )}
    </AnimatePresence>
  );
};

export default Skip;
