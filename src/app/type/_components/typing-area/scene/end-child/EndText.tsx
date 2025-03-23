import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import { useTypingStatusState } from "@/app/type/atoms/stateAtoms";
import { Box, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import RandomEmoji from "./child/RandomEmoji";

const EndText = () => {
  const { readGameUtils } = useGameUtilsRef();
  const { myBestScore, playMode } = readGameUtils();
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const status = useTypingStatusState();
  const isPerfect = status.miss === 0 && status.lost === 0;

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
        ) : myBestScore === 0 ? (
          <>初めての記録です！スコアは {status.score} です。</>
        ) : status.score > myBestScore ? (
          <>
            おめでとうございます！最高スコアが {myBestScore} から {status.score} に更新されました！
            <wbr />
            <RandomEmoji />
          </>
        ) : (
          <>
            最高スコアは {myBestScore} です。記録更新まであと {myBestScore - status.score} です。
          </>
        )}
      </Text>
      {speed.defaultSpeed < 1 && <Box>1.00倍速以上でランキング登録できます。</Box>}
    </Box>
  );
};

export default EndText;
