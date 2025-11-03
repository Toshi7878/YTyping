import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import { setLineResultSheet, useSceneState, useTypingStatusState } from "@/app/(typing)/type/_lib/atoms/state";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/ranking/use-get-my-ranking-result";
import { Button } from "@/components/ui/button";
import { RetryButton } from "./child/retry-button";
import { SubmitRankingButton } from "./submit-ranking-button";

export const EndButtonContainer = () => {
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const status = useTypingStatusState();
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const modeChangeBtnRef = useRef<HTMLButtonElement>(null);
  const scene = useSceneState();

  const isPerfect = status.miss === 0 && status.lost === 0;
  const getMyRankingResult = useGetMyRankingResult();

  const isPlayingMode = scene === "play_end";
  const isScoreUpdated = status.score >= (getMyRankingResult()?.score ?? 0);

  const isDisplayRankingButton: boolean =
    !!session && status.score > 0 && (isScoreUpdated || isPerfect) && speed.minPlaySpeed >= 1 && isPlayingMode;

  const [isSendResultBtnDisabled, setIsSendResultBtnDisabled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
          <SubmitRankingButton
            isScoreUpdated={isScoreUpdated}
            isSendResultBtnDisabled={isSendResultBtnDisabled}
            setIsSendResultBtnDisabled={setIsSendResultBtnDisabled}
          />
        )}

        <Button
          size="4xl"
          variant="primary-hover-light"
          className="max-sm:text-5xl max-sm:h-40 max-sm:w-xl"
          onClickCapture={(event) => {
            event.stopPropagation();
            setLineResultSheet((prev) => !prev);
          }}
        >
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
