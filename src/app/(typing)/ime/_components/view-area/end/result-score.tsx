import type { HTMLAttributes } from "react";
import { useStatusState } from "../../../_lib/atoms/state";

export const ResultScore = (props: HTMLAttributes<HTMLDivElement>) => {
  const statusState = useStatusState();
  return <div {...props}>スコア: {statusState.score}点</div>;
};
