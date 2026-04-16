import { useQueryClient } from "@tanstack/react-query";
import { getBuiltMap, useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { playYTPlayer, primeYTPlayerForMobilePlayback } from "@/app/(typing)/type/_feature/atoms/youtube-player";
import { iosActiveSound } from "@/app/(typing)/type/_feature/lib/sound-effect";
import { recalculateStatusFromResults } from "@/app/(typing)/type/_feature/typing-card/playing/update-status/recalc-from-results";
import { Button } from "@/components/ui/button";
import { overlay } from "@/components/ui/overlay";
import { getSession } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/provider";
import { readMapId } from "../../atoms/hydrate";
import { initializeAllLineResult } from "../../atoms/line-result";
import { getRankingMyResult } from "../../tabs/ranking/get-ranking-result";
import { getScene, setScene } from "../typing-card";

export const ReadyPracticeButton = () => {
  const map = useBuiltMapState();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const handleClick = async () => {
    if (map) {
      iosActiveSound();
      primeYTPlayerForMobilePlayback();
      overlay.loading("リザルトデータを読込中...");
      setScene("practice");
      const mapId = readMapId();
      const session = getSession();
      const resultId = mapId && session ? getRankingMyResult({ mapId, session })?.id : null;

      try {
        if (resultId) {
          const resultData = await queryClient.ensureQueryData(trpc.result.getJsonById.queryOptions({ resultId }));
          initializeAllLineResult(resultData);
        }
      } finally {
        overlay.hide();
        playYTPlayer();
        const map = getBuiltMap();
        const scene = getScene();
        if (map && scene === "practice") {
          recalculateStatusFromResults({ count: map.lines.length - 1, updateType: "lineUpdate" });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="h-auto px-16 py-6 text-5xl md:text-3xl" onClick={handleClick}>
      練習モードで開始
    </Button>
  );
};
