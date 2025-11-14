import { AnimatePresence, motion } from "framer-motion";
import { useSkipRemainTimeState } from "../../../_lib/atoms/state";
import { handleSkip } from "../../../_lib/core/skip";

interface SkipProps {
  className?: string;
}

export const Skip = ({ className }: SkipProps) => {
  const skipRemainTime = useSkipRemainTimeState();

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
