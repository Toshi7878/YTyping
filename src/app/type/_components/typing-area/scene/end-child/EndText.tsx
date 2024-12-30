import { GameStateRef, Speed, Status } from "@/app/type/ts/type";
import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import React from "react";
import RandomEmoji from "./child/RandomEmoji";

interface EndTextProps {
  isPerfect: boolean;
  gameStateRef: React.RefObject<GameStateRef>;
  session: Session | null;
  status: Status;
  bestScoreRef: React.RefObject<number>;
  speedData: Speed;
}

const EndText = ({
  isPerfect,
  gameStateRef,
  session,
  status,
  bestScoreRef,
  speedData,
}: EndTextProps) => {
  const playMode = gameStateRef.current!.playMode;

  return (
    <Box textAlign="left" fontSize="3xl" mx={2} id="end_text">
      {isPerfect && playMode === "playing" && <Text as="span">パーフェクト！！</Text>}
      <Text as="span">
        {playMode === "practice" ? (
          <>練習モード終了</>
        ) : playMode === "replay" ? (
          <>リプレイ再生終了</>
        ) : !session ? (
          <>
            スコアは{status.score}
            です。ログインをするとランキングに登録することができます。
          </>
        ) : bestScoreRef.current === 0 ? (
          <>初めての記録です！スコアは {status.score} です。</>
        ) : status.score > bestScoreRef.current! ? (
          <>
            おめでとうございます！最高スコアが {bestScoreRef.current} から {status.score}{" "}
            に更新されました！
            <RandomEmoji />
          </>
        ) : (
          <>
            最高スコアは {bestScoreRef.current} です。記録更新まであと{" "}
            {bestScoreRef.current! - status.score} です。
          </>
        )}
      </Text>
      {speedData.defaultSpeed < 1 && <Box>1.00倍速以上でランキング登録できます。</Box>}
    </Box>
  );
};

export default EndText;
