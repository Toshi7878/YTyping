import { useProgress } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import React, { useEffect } from "react";

interface TimeProgressProps {
  id: string;
}
const TimeProgress = (props: TimeProgressProps) => {
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
    <section className="w-full">
      <progress
        id={props.id}
        ref={progressRef}
        className={
          "[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary h-[20px] w-full md:h-[10px] [&::-moz-progress-bar]:rounded-lg [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:rounded-lg"
        }
      />
    </section>
  );
};

export default TimeProgress;
