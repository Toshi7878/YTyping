<<<<<<< HEAD
import { Box, Stack, useToast } from "@chakra-ui/react";
import React, { useEffect } from "react";
=======
import { Box, Stack } from "@chakra-ui/react";
import { useRef } from "react";
>>>>>>> 595212e9c2203d6108fe4a3e5d52a7ec326d8cc2
import { actions } from "@/app/type/(ts)/actions";
import { lineResultsAtom, mapIdAtom, speedAtom } from "@/app/type/(atoms)/gameRenderAtoms";
import { useAtomValue } from "jotai";
import { useFormState, useFormStatus } from "react-dom";
import { useRefs } from "@/app/type/(contexts)/refsProvider";

import { useSession } from "next-auth/react";
import EndText from "./end-child/EndText";
import EndSubButtonContainer from "./end-child/EndSubButtonContainer";
import EndMainButtonContainer from "./end-child/EndMainButtonContainer";

interface EndProps {
  onOpen: () => void;
}

const End = ({ onOpen }: EndProps) => {
  const { data: session } = useSession();

  const mapId = useAtomValue(mapIdAtom);
  const speedData = useAtomValue(speedAtom);
  const lineResults = useAtomValue(lineResultsAtom);

  const { bestScoreRef, statusRef, tabStatusRef, gameStateRef } = useRefs();

  const initialState = { id: null, message: "", status: 0 };
  const status = tabStatusRef.current!.getStatus();

  const upload = (): ReturnType<typeof actions> => {
    const rkpmTime =
      statusRef.current!.status.totalTypeTime - statusRef.current!.status.totalLatency;

    const score = status.score;
    const sendStatus = {
      romaType: statusRef.current!.status.romaType,
      kanaType: statusRef.current!.status.kanaType,
      flickType: statusRef.current!.status.flickType,
      miss: status.miss,
      lost: status.lost,
      rkpm: Math.round((status.type / rkpmTime) * 60),
      maxCombo: statusRef.current!.status.maxCombo,
      kpm: status.kpm,
      defaultSpeed: speedData.defaultSpeed,
    };
    const sendData = {
      mapId: mapId,
      lineResult: lineResults,
      status: sendStatus,
      score,
    };

    const result = actions(sendData);

    return result;
  };

  const [state, formAction] = useFormState(upload, initialState);

  const isPerfect = status.miss === 0 && status.lost === 0;
  const isPlayingMode =
    gameStateRef.current!.replay.userName === "" && !gameStateRef.current!.practice.isPracticeMode;

  const isScoreUpdated = status.score >= bestScoreRef.current;

  const isDisplayRankingButton: boolean =
    !!session &&
    status.score > 0 &&
    (isScoreUpdated || isPerfect) &&
    speedData.defaultSpeed >= 1 &&
    isPlayingMode;
  return (
    <Box flex="1" className="text-center mx-6">
      <Stack display="flex" spacing={8}>
        <EndText
          isPerfect={isPerfect}
          gameStateRef={gameStateRef}
          session={session}
          status={status}
          bestScoreRef={bestScoreRef}
          speedData={speedData}
        />
        <EndMainButtonContainer
          formAction={formAction}
          isDisplayRankingButton={isDisplayRankingButton}
          state={state}
          onOpen={onOpen}
          isScoreUpdated={isScoreUpdated}
        />
        <EndSubButtonContainer
          isPlayingMode={isPlayingMode}
          isDisplayRankingButton={isDisplayRankingButton}
          state={state}
          gameStateRef={gameStateRef}
        />
      </Stack>
    </Box>
  );
};

export default End;
