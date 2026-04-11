import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMapIdState } from "../../../_lib/atoms/hydrate";
import { getRankingMyResult } from "../../../_lib/get-ranking-result";
import { EndButtonContainer } from "./button-container";
import { ResultMessage } from "./result-message";

interface EndProps {
  className: string;
}

export const EndScene = ({ className }: EndProps) => {
  const mapId = useMapIdState();
  const { data: session } = useSession();
  const [bestScore] = useState(() =>
    mapId && session ? (getRankingMyResult({ mapId, session })?.score ?? null) : null,
  );

  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <ResultMessage bestScore={bestScore} />
      <EndButtonContainer bestScore={bestScore} />
    </div>
  );
};
