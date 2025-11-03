import {
  readLineCount,
  readUtilityRefParams,
  writeLineSubstatus,
  writeUtilityRefParams,
} from "@/app/(typing)/type/_lib/atoms/read-atoms";
import { usePlaySpeedReducer, useReadPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speed-reducer-atoms";
import {
  useReadAllLineResult,
  useReadGameUtilityParams,
  useReadLineWord,
  useSetCombo,
  useSetLineKpm,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useCalcTypeSpeed } from "@/app/(typing)/type/_lib/playing/use-calc-type-speed";
import { useInputModeChange } from "@/app/(typing)/type/_lib/playing/use-input-mode-change";
import type { TypeResult } from "@/server/drizzle/validator/result";
import type { YouTubeSpeed } from "@/utils/types";
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
  const readGameUtilityParams = useReadGameUtilityParams();
  const setLineKpm = useSetLineKpm();
  const setCombo = useSetCombo();
  const readLineResults = useReadAllLineResult();

  return ({ constantLineTime, constantRemainLineTime, type }: UseKeyReplayProps) => {
    const { c: key, is: isSuccess, op: option } = type;
    const count = readLineCount();
    // 0ライン目に記録されてしまっているリプレイが存在するためcount === 0はリプレイしない
    if (count === 0) return;

    if (key) {
      const typingKeys: TypingKeys = {
        keys: [key],
        key,
        code: `Key${key.toUpperCase()}`,
      };

      if (isSuccess) {
        const { inputMode } = readGameUtilityParams();
        const lineWord = readLineWord();
        const { newLineWord, successKey, updatePoint } =
          inputMode === "roma" ? new RomaInput({ typingKeys, lineWord }) : new KanaInput({ typingKeys, lineWord });

        if (!newLineWord || !successKey) return;

        setLineWord(newLineWord);
        const isCompleted = newLineWord.nextChar.k === "";
        triggerTypeSound({ isCompleted });

        calcTypeSpeed({ updateType: "keydown", constantLineTime });

        updateSuccessStatusRefs({ constantLineTime, successKey });

        if (!isCompleted) {
          updateSuccessStatus({ constantRemainLineTime, updatePoint });
        } else {
          const lineResults = readLineResults();
          const lineResult = lineResults[count];

          updateAllStatus({ count, updateType: "completed" });
          writeLineSubstatus({ isCompleted: true });
          setCombo(lineResult?.status.combo ?? 0);
          setLineKpm(lineResult?.status.lKpm ?? 0);
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

  return ({
    constantLineTime,
    constantRemainLineTime,
  }: {
    constantLineTime: number;
    constantRemainLineTime: number;
  }) => {
    const count = readLineCount();
    const lineResults = readAllLineResults();

    const lineResult = lineResults[count];
    if (!lineResult) return;
    const { types } = lineResult;
    if (types.length === 0) return;

    const { replayKeyCount } = readUtilityRefParams();
    const type = types[replayKeyCount];
    if (!type) return;

    const keyTime = type.t;

    if (constantLineTime >= keyTime) {
      playBackKey({ constantLineTime, constantRemainLineTime, type });
      writeUtilityRefParams({ replayKeyCount: replayKeyCount + 1 });
    }
  };
};

export const useLineReplayUpdate = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const inputModeChange = useInputModeChange();

  const readAllLineResults = useReadAllLineResult();
  const readPlaySpeed = useReadPlaySpeed();

  return (newCurrentCount: number) => {
    const lineResults = readAllLineResults();

    const lineResult = lineResults[newCurrentCount];

    if (!lineResult) {
      return;
    }

    void inputModeChange(lineResult.status.mode);

    writeUtilityRefParams({ replayKeyCount: 0 });

    const { playSpeed } = readPlaySpeed();
    const speed = lineResult.status.sp as YouTubeSpeed;

    if (playSpeed === speed) return;
    dispatchSpeed({ type: "set", payload: speed });
  };
};
