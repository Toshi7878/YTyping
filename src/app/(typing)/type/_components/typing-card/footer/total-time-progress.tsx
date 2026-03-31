import React, { useEffect } from "react";
import { writeTotalProgress } from "../../../_lib/atoms/ref";

interface TotalTimeProgressProps {
  id: string;
}
export const TotalTimeProgress = (props: TotalTimeProgressProps) => {
  const progressRef = React.useRef<HTMLProgressElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      writeTotalProgress(progressRef.current);
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
