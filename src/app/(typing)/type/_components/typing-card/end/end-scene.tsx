import { cn } from "@/lib/utils";
import { EndButtonContainer } from "./button-container";
import { ResultMessage } from "./result-message";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { getRankingMyResult } from "../../../_lib/get-ranking-result";
import { useMapIdState } from "../../../_lib/atoms/hydrate";

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
