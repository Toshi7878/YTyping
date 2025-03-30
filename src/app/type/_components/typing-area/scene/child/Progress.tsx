import { useProgress } from "@/app/type/atoms/refAtoms";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import React, { useEffect } from "react";

interface ProgressProps {
  id: string;
}
const Progress = (props: ProgressProps) => {
  const theme: ThemeColors = useTheme();
  const progressRef = React.useRef<HTMLProgressElement>(null);

  const { writeLineProgress, writeTotalProgress } = useProgress();

  useEffect(() => {
    if (progressRef.current) {
      if (props.id === "line_progress") {
        writeLineProgress(progressRef.current!);
      } else {
        writeTotalProgress(progressRef.current!);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box>
        <progress id={props.id} ref={progressRef} className="w-full h-[20px] md:h-[10px]" />
      </Box>
      <style>
        {`#${props.id}::-webkit-progress-value {
          background: ${theme.colors.primary.main};
            border-radius: 5px;
          }`}
      </style>
    </>
  );
};

export default Progress;
