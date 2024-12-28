import { useStatusAtomsValues, useTypePageSpeedAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { Stack } from "@chakra-ui/react";
import { useFormState } from "react-dom";

import { useSendResult } from "@/app/type/hooks/useSendResult";
import { INITIAL_STATE } from "@/config/global-consts";
import { useSession } from "next-auth/react";
import { CARD_BODY_MIN_HEIGHT } from "../TypingCard";
import EndMainButtonContainer from "./end-child/EndMainButtonContainer";
import EndSubButtonContainer from "./end-child/EndSubButtonContainer";
import EndText from "./end-child/EndText";

interface EndProps {
  onOpen: () => void;
}

const End = ({ onOpen }: EndProps) => {
  const { data: session } = useSession();

  const speedData = useTypePageSpeedAtom();

  const sendResult = useSendResult();
  const statusAtomsValues = useStatusAtomsValues();

  const [state, formAction] = useFormState(sendResult, INITIAL_STATE);

  const { bestScoreRef, gameStateRef } = useRefs();

  const status = statusAtomsValues();

  if (status === undefined) {
    //タイピングページ　→　タイピングページに遷移時returnしないとclient errorがでる
    return;
  }

  const isPerfect = status.miss === 0 && status.lost === 0;
  const isPlayingMode = gameStateRef.current!.playMode === "playing";

  const isScoreUpdated = status.score >= bestScoreRef.current;

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
        gameStateRef={gameStateRef}
        session={session}
        status={status}
        bestScoreRef={bestScoreRef}
        speedData={speedData}
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
        gameStateRef={gameStateRef}
      />
    </Stack>
  );
};

export default End;
