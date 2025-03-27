import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import { useTypingStatusState } from "@/app/type/atoms/stateAtoms";
import { HStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
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
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const modeChangeBtnRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      switch (event.code) {
        case "F4":
          retryBtnRef.current?.click();
          event.preventDefault();

          break;
        case "F7":
          modeChangeBtnRef.current?.click();
          event.preventDefault();

          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <EndSubButton
          retryBtnRef={modeChangeBtnRef}
          retryMode={playMode !== "playing" ? "playing" : "practice"}
          isRetryAlert={Boolean(isDisplayRankingButton && !isSendResultBtnDisabled)}
        />
        <EndSubButton
          retryBtnRef={retryBtnRef}
          retryMode={playMode}
          isRetryAlert={Boolean(isDisplayRankingButton && !isSendResultBtnDisabled)}
        />
      </HStack>
    </>
  );
};

export default EndButtonContainer;
