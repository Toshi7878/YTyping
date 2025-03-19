import { usePlaySpeedState } from "@/app/type/atoms/reducerAtoms";
import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useTypingStatusState } from "@/app/type/atoms/stateAtoms";
import { HStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import EndUploadButton from "./EndRankingButton";
import EndMainButton from "./child/EndMainButton";
import EndSubButton from "./child/EndSubButton";

interface EndButtonContainerProps {
  onOpen: () => void;
}

const EndButtonContainer = ({ onOpen }: EndButtonContainerProps) => {
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const status = useTypingStatusState();
  const { readGameUtils } = useGameUtilsRef();

  const isPerfect = status.miss === 0 && status.lost === 0;
  const { playMode, myBestScore } = readGameUtils();

  const isPlayingMode = playMode === "playing";
  const isScoreUpdated = status.score >= myBestScore;

  const isDisplayRankingButton: boolean =
    !!session &&
    status.score > 0 &&
    (isScoreUpdated || isPerfect) &&
    speed.defaultSpeed >= 1 &&
    isPlayingMode;

  const [isSendResultBtnDisabled, setIsSendResultBtnDisabled] = useState(false);

  return (
    <>
      <HStack justifyContent="space-around" id="end_main_buttons">
        {isDisplayRankingButton && (
          <EndUploadButton
            isScoreUpdated={isScoreUpdated}
            isSendResultBtnDisabled={isSendResultBtnDisabled}
            setIsSendResultBtnDisabled={setIsSendResultBtnDisabled}
          />
        )}

        <EndMainButton onClick={onOpen}>詳細リザルトを見る</EndMainButton>
      </HStack>
      <HStack spacing={14} justifyContent="flex-end" mx="12" id="end_sub_buttons">
        {isPlayingMode && (
          <EndSubButton
            retryMode="practice"
            isRetryAlert={Boolean(isDisplayRankingButton && isSendResultBtnDisabled)}
          />
        )}

        <EndSubButton
          retryMode={playMode}
          isRetryAlert={Boolean(isDisplayRankingButton && isSendResultBtnDisabled)}
        />
      </HStack>
    </>
  );
};

export default EndButtonContainer;
