import React, { useEffect } from "react";
import { writeLineProgress, writeTotalProgress } from "../../_lib/atoms/read-atoms";

interface TimeProgressProps {
  id: string;
}
export const TimeProgress = (props: TimeProgressProps) => {
  const progressRef = React.useRef<HTMLProgressElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      if (props.id === "line_progress") {
        writeLineProgress(progressRef.current);
      } else {
        writeTotalProgress(progressRef.current);
      }
    }
  }, []);

  return (
    <section className="w-full">
      <progress
        id={props.id}
        ref={progressRef}
        className={
          "[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary h-[16px] max-sm:my-2 w-full md:h-[10px] [&::-moz-progress-bar]:rounded-lg [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:rounded-lg"
        }
      />
    </section>
  );
};
