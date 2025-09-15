import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import { useSceneState, useSetLineResultDrawer, useTypingStatusState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/hooks/getMyRankingResult";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import EndUploadButton from "./EndRankingButton";
import { default as RetryButton } from "./child/EndSubButton";

const EndButtonContainer = () => {
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const status = useTypingStatusState();
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const modeChangeBtnRef = useRef<HTMLButtonElement>(null);
  const scene = useSceneState();
  const setLineResultDrawer = useSetLineResultDrawer();

  const isPerfect = status.miss === 0 && status.lost === 0;
  const getMyRankingResult = useGetMyRankingResult();

  const isPlayingMode = scene === "play_end";
  const isScoreUpdated = status.score >= (getMyRankingResult()?.score ?? 0);

  const isDisplayRankingButton: boolean =
    !!session && status.score > 0 && (isScoreUpdated || isPerfect) && speed.defaultSpeed >= 1 && isPlayingMode;

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
  }, []);

  const playMode = scene === "play_end" ? "play" : scene === "practice_end" ? "practice" : "replay";
  return (
    <>
      <div className="flex items-center justify-around" id="end_main_buttons">
        {isDisplayRankingButton && (
          <EndUploadButton
            isScoreUpdated={isScoreUpdated}
            isSendResultBtnDisabled={isSendResultBtnDisabled}
            setIsSendResultBtnDisabled={setIsSendResultBtnDisabled}
          />
        )}

        <Button size="4xl" variant="primary-hover-light" onClick={() => setLineResultDrawer((prev) => !prev)}>
          詳細リザルトを見る
        </Button>
      </div>
      <div className="mx-12 flex items-center justify-end gap-14" id="end_sub_buttons">
        <RetryButton
          retryBtnRef={modeChangeBtnRef}
          retryMode={scene !== "play_end" ? "play" : "practice"}
          isRetryAlert={Boolean(isDisplayRankingButton && !isSendResultBtnDisabled)}
        />
        <RetryButton
          retryBtnRef={retryBtnRef}
          retryMode={playMode}
          isRetryAlert={Boolean(isDisplayRankingButton && !isSendResultBtnDisabled)}
        />
      </div>
    </>
  );
};

export default EndButtonContainer;
