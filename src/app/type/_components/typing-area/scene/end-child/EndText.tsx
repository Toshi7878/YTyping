import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { TypingStatusAtomValue } from "@/app/type/atoms/stateAtoms";
import { PlayMode, Speed } from "@/app/type/ts/type";
import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import RandomEmoji from "./child/RandomEmoji";

interface EndTextProps {
  isPerfect: boolean;
  playMode: PlayMode;
  session: Session | null;
  status: TypingStatusAtomValue;
  speedData: Speed;
}

const EndText = ({ isPerfect, session, status, speedData, playMode }: EndTextProps) => {
  const { readGameUtils } = useGameUtilsRef();
  const bestScore = readGameUtils().myBestScore;
  return (
    <Box textAlign="left" fontSize={{ base: "3rem", md: "3xl" }} mx={2} id="end_text">
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
        ) : bestScore === 0 ? (
          <>初めての記録です！スコアは {status.score} です。</>
        ) : status.score > bestScore! ? (
          <>
            おめでとうございます！最高スコアが {bestScore} から {status.score} に更新されました！
            <wbr />
            <RandomEmoji />
          </>
        ) : (
          <>
            最高スコアは {bestScore} です。記録更新まであと {bestScore - status.score} です。
          </>
        )}
      </Text>
      {speedData.defaultSpeed < 1 && <Box>1.00倍速以上でランキング登録できます。</Box>}
    </Box>
  );
};

export default EndText;
