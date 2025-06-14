import { useProgress } from "@/app/(typing)/type/atoms/refAtoms";
import React, { useEffect } from "react";

interface ProgressProps {
  id: string;
}
const Progress = (props: ProgressProps) => {
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
      <div>
        <progress id={props.id} ref={progressRef} className="w-full h-[20px] md:h-[10px]" />
      </div>
      <style>
        {`#${props.id}::-webkit-progress-value {
          background: #3182CE;
            border-radius: 5px;
          }`}
      </style>
    </>
  );
};

export default Progress;
