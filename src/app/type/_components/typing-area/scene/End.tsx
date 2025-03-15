import { useGameRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedAtom, useTypingStatusAtom } from "@/app/type/atoms/stateAtoms";
import { useUpdateUserStats } from "@/app/type/hooks/playing-hooks/useUpdateUserStats";
import { useSendResult } from "@/app/type/hooks/useSendResult";
import { INITIAL_STATE } from "@/config/consts/globalConst";
import { Stack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { CARD_BODY_MIN_HEIGHT } from "../TypingCard";
import EndMainButtonContainer from "./end-child/EndMainButtonContainer";
import EndSubButtonContainer from "./end-child/EndSubButtonContainer";
import EndText from "./end-child/EndText";

interface EndProps {
  onOpen: () => void;
}

const End = ({ onOpen }: EndProps) => {
  const { data: session } = useSession();
  const speedData = usePlaySpeedAtom();
  const sendResult = useSendResult();
  const [state, formAction] = useFormState(sendResult, INITIAL_STATE);
  const { updateTypingStats } = useUpdateUserStats();
  const { readGameRef } = useGameRef();

  useEffect(() => {
    updateTypingStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = useTypingStatusAtom();

  if (status === undefined) {
    //タイピングページ　→　タイピングページに遷移時returnしないとclient errorがでる
    return;
  }

  const isPerfect = status.miss === 0 && status.lost === 0;
  const isPlayingMode = readGameRef().playMode === "playing";
  const isScoreUpdated = status.score >= readGameRef().myBestScore;

  const isDisplayRankingButton: boolean =
    !!session &&
    status.score > 0 &&
    (isScoreUpdated || isPerfect) &&
    speedData.defaultSpeed >= 1 &&
    isPlayingMode;

  return (
    <Stack minH={CARD_BODY_MIN_HEIGHT} justifyContent="space-between">
      <EndText
        isPerfect={isPerfect}
        session={session}
        status={status}
        speedData={speedData}
        playMode={readGameRef().playMode}
      />
      <EndMainButtonContainer
        formAction={formAction}
        isDisplayRankingButton={isDisplayRankingButton}
        state={state}
        onOpen={onOpen}
        isScoreUpdated={isScoreUpdated}
        isPlayingMode={isPlayingMode}
      />
      <EndSubButtonContainer
        isPlayingMode={isPlayingMode}
        isDisplayRankingButton={isDisplayRankingButton}
        state={state}
        playMode={readGameRef().playMode}
      />
    </Stack>
  );
};

export default End;
