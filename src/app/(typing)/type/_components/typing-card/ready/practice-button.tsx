import { useSession } from "next-auth/react";
import { readBuiltMap, readScene, setScene, useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { playYTPlayer, primeYTPlayerForMobilePlayback } from "@/app/(typing)/type/_lib/atoms/youtube-player";
import { getRankingMyResult } from "@/app/(typing)/type/_lib/get-ranking-result";
import { iosActiveSound } from "@/app/(typing)/type/_lib/playing/sound-effect";
import { recalculateStatusFromResults } from "@/app/(typing)/type/_lib/playing/update-status/recalc-from-results";
import { queryResultJson } from "@/app/(typing)/type/_lib/query-result-json";
import { Button } from "@/components/ui/button";
import { overlay } from "@/components/ui/overlay";

export const ReadyPracticeButton = () => {
  const map = useBuiltMapState();
  const { data: session } = useSession();

  const handleClick = async () => {
    if (map) {
      iosActiveSound();
      primeYTPlayerForMobilePlayback();
      overlay.loading("リザルトデータを読込中...");
      setScene("practice");
      const resultId = getRankingMyResult(session)?.id;

      try {
        if (resultId) {
          await queryResultJson(resultId);
        }
      } finally {
        overlay.hide();
        playYTPlayer();
        const map = readBuiltMap();
        const scene = readScene();
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
