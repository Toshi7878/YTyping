import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMapIdState } from "../../../_atoms/hydrate";
import { getRankingMyResult } from "../../tabs/ranking/get-ranking-result";
import { useTypingStatusState } from "../../tabs/typing-status/status-cell";
import { EndButtonContainer } from "./button-container";
import { ResultMessage } from "./result-message";

interface EndProps {
  className: string;
}

export const EndScene = ({ className }: EndProps) => {
  const mapId = useMapIdState();
  const { data: session } = useSession();
  const status = useTypingStatusState();
  const [bestScore] = useState(() =>
    mapId && session ? (getRankingMyResult({ mapId, session })?.score ?? null) : null,
  );

  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <ResultMessage bestScore={bestScore} status={status} />
      <EndButtonContainer bestScore={bestScore} status={status} />
    </div>
  );
};
