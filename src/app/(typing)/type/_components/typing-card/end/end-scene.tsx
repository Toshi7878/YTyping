import { useEffect } from "react";
import { mutateTypingStats } from "@/app/(typing)/type/_lib/playing/mutate-stats";
import { cn } from "@/lib/utils";
import { EndButtonContainer } from "./end-child/end-button-container";
import { EndText } from "./end-child/end-text";

interface EndProps {
  className: string;
}

export const EndScene = ({ className }: EndProps) => {
  useEffect(() => {
    mutateTypingStats();
  }, []);

  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <EndText />
      <EndButtonContainer />
    </div>
  );
};
