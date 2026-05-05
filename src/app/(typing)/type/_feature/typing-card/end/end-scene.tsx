import { useParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/auth/client";
import { cn } from "@/utils/cn";
import { getRankingMyResult } from "../../tabs/ranking/get-ranking-result";
import { useTypingStatusState } from "../../tabs/typing-status/status-cell";
import { EndButtonContainer } from "./button-container";
import { ResultMessage } from "./result-message";

interface EndProps {
  className: string;
}

export const EndScene = ({ className }: EndProps) => {
  const { id: mapId } = useParams();
  const { data: session } = useSession();
  const status = useTypingStatusState();
  const [bestScore] = useState(() =>
    mapId && session ? (getRankingMyResult({ mapId: Number(mapId), session })?.score ?? null) : null,
  );

  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <ResultMessage bestScore={bestScore} status={status} />
      <EndButtonContainer bestScore={bestScore} status={status} />
    </div>
  );
};
