import React, { useEffect } from "react";
import { writeLineProgress, writeTotalProgress } from "../../_lib/atoms/ref";

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
          "h-[16px] w-full max-sm:my-2 md:h-[10px] [&::-moz-progress-bar]:rounded-lg [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-primary"
        }
      />
    </section>
  );
};
