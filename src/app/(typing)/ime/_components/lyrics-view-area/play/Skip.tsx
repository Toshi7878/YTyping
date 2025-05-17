import { Box, BoxProps } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useSkipRemainTimeState } from "../../../atom/stateAtoms";
import { useSkip } from "../../../hooks/skip";

const Skip = (props: BoxProps) => {
  const skipRemainTime = useSkipRemainTimeState();
  const handleSkip = useSkip();

  const handleClick = () => {
    if (skipRemainTime === null) return;

    handleSkip();
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
