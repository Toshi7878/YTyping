import { useSendUserStats } from "@/app/(typing)/type/_lib/hooks/playing-hooks/sendUserStats";
import { useEffect } from "react";
import EndButtonContainer from "./end-child/EndButtonContainer";
import EndText from "./end-child/EndText";

interface EndProps {
  onOpen: () => void;
}

const End = ({ onOpen }: EndProps) => {
  const { sendTypingStats } = useSendUserStats();

  useEffect(() => {
    sendTypingStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[460px] flex-col justify-between md:min-h-[320px]">
      <EndText />
      <EndButtonContainer onOpen={onOpen} />
    </div>
  );
};

export default End;
