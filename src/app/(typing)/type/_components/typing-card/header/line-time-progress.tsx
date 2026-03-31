import React, { useEffect } from "react";
import { writeLineProgress } from "../../../_lib/atoms/ref";

interface LineTimeProgressProps {
  id: string;
}
export const LineTimeProgress = (props: LineTimeProgressProps) => {
  const progressRef = React.useRef<HTMLProgressElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      writeLineProgress(progressRef.current);
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
