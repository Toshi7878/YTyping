import { useSendUserStats } from "@/app/type/hooks/playing-hooks/sendUserStats";
import { CARD_BODY_MIN_HEIGHT } from "@/app/type/ts/const/consts";
import { Stack } from "@chakra-ui/react";
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
    <Stack minH={CARD_BODY_MIN_HEIGHT} justifyContent="space-between">
      <EndText />
      <EndButtonContainer onOpen={onOpen} />
    </Stack>
  );
};

export default End;
