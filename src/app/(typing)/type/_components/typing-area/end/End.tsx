import { useSendUserStats } from "@/app/(typing)/type/_lib/hooks/playing/sendUserStats";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import EndButtonContainer from "./end-child/EndButtonContainer";
import EndText from "./end-child/EndText";

interface EndProps {
  className?: string;
}

const End = ({ className }: EndProps) => {
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

export default End;
