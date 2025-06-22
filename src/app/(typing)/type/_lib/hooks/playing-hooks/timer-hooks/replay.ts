import { useGameUtilityReferenceParams, useLineCount } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { usePlaySpeedReducer } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useReadLineResults,
  useReadLineWord,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useCalcTypeSpeed } from "@/app/(typing)/type/_lib/hooks/playing-hooks/calcTypeSpeed";
import { useInputModeChange } from "@/app/(typing)/type/_lib/hooks/playing-hooks/inputModeChange";
import { YouTubeSpeed } from "@/types";
import { LineResultData, TypeResult } from "../../../type";
import { useGetTime } from "../getYTTime";
import { KanaInput, RomaInput, TypingKeys } from "../keydown-hooks/typingJudge";
import { useSoundEffect } from "../soundEffect";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../updateStatus";

interface UseKeyReplayProps {
  constantLineTime: number;
  typeResult: TypeResult;
  lineResult: LineResultData;
}

const usePlayBackKey = () => {
  const setLineWord = useSetLineWord();

  const inputModeChange = useInputModeChange();
  const dispatchSpeed = usePlaySpeedReducer();
  const { getConstantRemainLineTime } = useGetTime();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const readLineWord = useReadLineWord();
  const readGameStateUtils = useReadGameUtilParams();
  const { readCount } = useLineCount();

  return ({ constantLineTime, typeResult }: UseKeyReplayProps) => {
    const key = typeResult.c;
    const isSuccess = typeResult.is;
    const option = typeResult.op;
    const count = readCount();

    if (key) {
      const typingKeys: TypingKeys = {
        keys: [key],
        key: key,
        code: `Key${key.toUpperCase()}`,
      };

      if (isSuccess) {
        const { inputMode } = readGameStateUtils();
        const lineWord = readLineWord();
        const result =
          inputMode === "roma" ? new RomaInput({ typingKeys, lineWord }) : new KanaInput({ typingKeys, lineWord });
        setLineWord(result.newLineWord);
        const isCompleted = result.newLineWord.nextChar["k"] === "";
        triggerTypingSound({ isCompleted });

        const lineRemainConstantTime = getConstantRemainLineTime(constantLineTime);
        calcTypeSpeed({
          updateType: "keydown",
          constantLineTime,
        });

        updateSuccessStatusRefs({
          constantLineTime,
          successKey: result.successKey,
        });

        if (!isCompleted) {
          updateSuccessStatus({
            lineRemainConstantTime,
            updatePoint: result.updatePoint,
          });
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
          inputModeChange("roma");
          break;
        case "kana":
          inputModeChange("kana");
          break;
        case "speedChange":
          dispatchSpeed({ type: "toggle" });
          break;
      }
    }
  };
};

export const useReplay = () => {
  const keyReplay = usePlayBackKey();
  const readLineResults = useReadLineResults();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readCount } = useLineCount();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const count = readCount();
    const lineResults = readLineResults();

    const lineResult: LineResultData = lineResults[count - 1];
    const typeResults = lineResult.typeResult;

    if (typeResults.length === 0) {
      return;
    }
    const { replayKeyCount } = readGameUtilRefParams();
    const typeData = typeResults[replayKeyCount];

    if (!typeData) {
      return;
    }

    const keyTime = typeData.t;

    if (constantLineTime >= keyTime) {
      keyReplay({ constantLineTime: constantLineTime, lineResult, typeResult: typeData });
      writeGameUtilRefParams({ replayKeyCount: replayKeyCount + 1 });
    }
  };
};

export const useLineReplayUpdate = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const inputModeChange = useInputModeChange();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readLineResults = useReadLineResults();

  return (newCurrentCount: number) => {
    const lineResults = readLineResults();

    const lineResult = lineResults[newCurrentCount];

    inputModeChange(lineResult.status.mode);
    const speed = lineResult.status.sp as YouTubeSpeed;
    dispatchSpeed({ type: "set", payload: speed });
    writeGameUtilRefParams({ replayKeyCount: 0 });
  };
};
