import { AnimatePresence, motion } from "framer-motion";
import { useSkipRemainTimeState } from "../../../atom/stateAtoms";
import { useSkip } from "../../../hooks/skip";

interface SkipProps {
  className?: string;
}

const Skip = ({ className }: SkipProps) => {
  const skipRemainTime = useSkipRemainTimeState();
  const handleSkip = useSkip();

  const handleClick = () => {
    if (skipRemainTime === null) return;

    handleSkip();
  };

  return (
    <AnimatePresence>
      {skipRemainTime !== null && (
        <motion.div
          className={`cursor-pointer text-[60%] hover:underline ${className || ""}`}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
        >
          Skip ({skipRemainTime})
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Skip;
