import { toggleClapServerAction } from "@/server/actions/toggleClapActions";
import { LocalClapState, UploadResult } from "@/types";
import { useEffect, useOptimistic, useState } from "react";

export const useLocalClapServerActions = ({ hasClap, clapCount }: LocalClapState) => {
  const [clapLocalState, setClapLocalState] = useState<LocalClapState>({
    hasClap,
    clapCount,
  });

  useEffect(() => {
    if (clapLocalState.hasClap !== hasClap) {
      setClapLocalState({ hasClap, clapCount });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasClap, clapCount]);

  const [clapOptimisticState, setClapOptimisticState] = useOptimistic(
    clapLocalState.hasClap !== hasClap ? clapLocalState : { hasClap, clapCount },
    (currentState, newState) => {
      return newState as LocalClapState;
    },
  );

  const [isToggling, setIsToggling] = useState(false); // 連打対策用のフラグ

  const toggleClapAction = async (resultId: number): Promise<UploadResult> => {
    if (isToggling) return Promise.reject(new Error("Action is already in progress")); // 連打防止
    setIsToggling(true); // フラグを立てる

    // 楽観的UI更新
    const newOptimisticState = {
      hasClap: !clapOptimisticState.hasClap,
      clapCount: clapOptimisticState.hasClap
        ? clapOptimisticState.clapCount - 1
        : clapOptimisticState.clapCount + 1,
    };

    setClapOptimisticState(newOptimisticState);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await toggleClapServerAction(resultId, newOptimisticState.hasClap);
      if (result.status === 200) {
        setClapLocalState(newOptimisticState);
      }

      return result;
    } catch (error) {
      // エラーが発生した場合、元の状態に戻す
      setClapLocalState(clapLocalState);

      return Promise.reject(error); // エラーを返す
    } finally {
      setIsToggling(false); // フラグをリセット
    }
  };

  return { clapOptimisticState, toggleClapAction };
};
