import { toggleLikeServerAction } from "@/server/actions/toggleLikeActions";
import { LocalLikeState, UploadResult } from "@/types";
import { useEffect, useOptimistic, useState } from "react";

interface useLocalLikeServerActionsProps {
  hasLike: LocalLikeState["hasLike"];
  likeCount: LocalLikeState["likeCount"];
}

export const useLocalLikeServerActions = ({
  hasLike,
  likeCount,
}: useLocalLikeServerActionsProps) => {
  const [likeLocalState, setLikeLocalState] = useState<LocalLikeState>({
    hasLike,
    likeCount,
  });

  useEffect(() => {
    if (likeLocalState.hasLike !== hasLike) {
      setLikeLocalState({ hasLike, likeCount });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLike, likeCount]);

  const [likeOptimisticState, setLikeOptimisticState] = useOptimistic(
    likeLocalState.hasLike !== hasLike ? likeLocalState : { hasLike, likeCount },
    (currentState, newState) => {
      return newState as LocalLikeState;
    }
  );

  const [isToggling, setIsToggling] = useState(false); // 連打対策用のフラグ

  const toggleLikeAction = async (mapId: number): Promise<UploadResult> => {
    if (isToggling) return Promise.reject(new Error("Action is already in progress")); // 連打防止
    setIsToggling(true); // フラグを立てる

    // 楽観的UI更新
    const newOptimisticState: LocalLikeState = {
      hasLike: !likeOptimisticState.hasLike,
      likeCount: likeOptimisticState.hasLike
        ? likeOptimisticState.likeCount - 1
        : likeOptimisticState.likeCount + 1,
    };

    setLikeOptimisticState(newOptimisticState);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await toggleLikeServerAction(mapId, newOptimisticState.hasLike);
      if (result.status === 200) {
        setLikeLocalState(newOptimisticState);
      }

      return result;
    } catch (error) {
      // エラーが発生した場合、元の状態に戻す
      setLikeLocalState(likeLocalState);

      return Promise.reject(error); // エラーを返す
    } finally {
      setIsToggling(false); // フラグをリセット
    }
  };

  return { likeOptimisticState, toggleLikeAction };
};
