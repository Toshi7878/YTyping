import { useGameUtilityReferenceParams, useLineCount } from "@/app/(typing)/type/_lib/atoms/read-atoms";
import { usePlaySpeedReducer, useReadPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speed-reducer-atoms";
import {
  useReadAllLineResult,
  useReadGameUtilParams,
  useReadLineWord,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useCalcTypeSpeed } from "@/app/(typing)/type/_lib/playing/use-calc-type-speed";
import { useInputModeChange } from "@/app/(typing)/type/_lib/playing/use-input-mode-change";
import type { TypeResult } from "@/server/drizzle/validator/result";
import type { YouTubeSpeed } from "@/types/types";
import { KanaInput, RomaInput, type TypingKeys } from "../keydown/use-typing-judge";
import { useSoundEffect } from "../use-sound-effect";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../use-update-status";

interface UseKeyReplayProps {
  constantLineTime: number;
  constantRemainLineTime: number;
  type: TypeResult;
}

const usePlayBackKey = () => {
  const setLineWord = useSetLineWord();

  const inputModeChange = useInputModeChange();
  const dispatchSpeed = usePlaySpeedReducer();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypeSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const readLineWord = useReadLineWord();
  const readGameStateUtils = useReadGameUtilParams();
  const { readCount } = useLineCount();

  return ({ constantLineTime, constantRemainLineTime, type }: UseKeyReplayProps) => {
    const { c: key, is: isSuccess, op: option } = type;
    const count = readCount();

    if (key) {
      const typingKeys: TypingKeys = {
        keys: [key],
        key,
        code: `Key${key.toUpperCase()}`,
      };

      if (isSuccess) {
        const { inputMode } = readGameStateUtils();
        const lineWord = readLineWord();
        const result =
          inputMode === "roma" ? new RomaInput({ typingKeys, lineWord }) : new KanaInput({ typingKeys, lineWord });
        setLineWord(result.newLineWord);
        const isCompleted = result.newLineWord.nextChar.k === "";
        triggerTypeSound({ isCompleted });

        calcTypeSpeed({
          updateType: "keydown",
          constantLineTime,
        });

        updateSuccessStatusRefs({
          constantLineTime,
          successKey: result.successKey,
        });

        if (!isCompleted) {
          updateSuccessStatus({ constantRemainLineTime, updatePoint: result.updatePoint });
        } else {
          updateAllStatus({ count, updateType: "completed" });
        }
      } else {
        triggerMissSound();
        updateMissStatus();
        updateMissRefStatus({ constantLineTime, failKey: key });
      }
    } else if (option) {
      switch (option) {
        case "roma":
          void inputModeChange("roma");
          break;
        case "kana":
          void inputModeChange("kana");
          break;
        case "speedChange":
          dispatchSpeed({ type: "toggle" });
          break;
      }
    }
  };
};

export const useReplay = () => {
  const playBackKey = usePlayBackKey();
  const readAllLineResults = useReadAllLineResult();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readCount } = useLineCount();

  return ({
    constantLineTime,
    constantRemainLineTime,
  }: {
    constantLineTime: number;
    constantRemainLineTime: number;
  }) => {
    const count = readCount();
    const lineResults = readAllLineResults();

    const lineResult = lineResults[count - 1];
    if (!lineResult) return;
    const { types } = lineResult;
    if (types.length === 0) return;

    const { replayKeyCount } = readGameUtilRefParams();
    const type = types[replayKeyCount];
    if (!type) return;

    const keyTime = type.t;

    if (constantLineTime >= keyTime) {
      playBackKey({ constantLineTime, constantRemainLineTime, type });
      writeGameUtilRefParams({ replayKeyCount: replayKeyCount + 1 });
    }
  };
};

export const useLineReplayUpdate = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const inputModeChange = useInputModeChange();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readAllLineResults = useReadAllLineResult();
  const readPlaySpeed = useReadPlaySpeed();

  return (newCurrentCount: number) => {
    const lineResults = readAllLineResults();

    const lineResult = lineResults[newCurrentCount];

    if (!lineResult) {
      return;
    }

    void inputModeChange(lineResult.status.mode);

    writeGameUtilRefParams({ replayKeyCount: 0 });

    const { playSpeed } = readPlaySpeed();
    const speed = lineResult.status.sp as YouTubeSpeed;

    if (playSpeed === speed) return;
    dispatchSpeed({ type: "set", payload: speed });
  };
};
