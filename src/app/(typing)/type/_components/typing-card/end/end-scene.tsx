import { useEffect } from "react";
import { useSendUserStats } from "@/app/(typing)/type/_lib/playing/use-send-user-stats";
import { cn } from "@/lib/utils";
import { EndButtonContainer } from "./end-child/end-button-container";
import { EndText } from "./end-child/end-text";

interface EndProps {
  className: string;
}

export const EndScene = ({ className }: EndProps) => {
  const { sendTypingStats } = useSendUserStats();

  useEffect(() => {
    sendTypingStats();
  }, []);

  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <EndText />
      <EndButtonContainer />
    </div>
  );
};
