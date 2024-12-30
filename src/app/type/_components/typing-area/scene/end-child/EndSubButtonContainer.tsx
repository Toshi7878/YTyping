import { HStack } from "@chakra-ui/react";
import React from "react";
import EndSubButton from "./child/EndSubButton";
import { GameStateRef } from "@/app/type/ts/type";
import { UploadResult } from "@/types";

interface EndSubButtonContainerProps {
  isPlayingMode: boolean;
  isDisplayRankingButton: boolean;
  state: UploadResult;
  gameStateRef: React.RefObject<GameStateRef>;
}

const EndSubButtonContainer = ({
  isPlayingMode,
  isDisplayRankingButton,
  state,
  gameStateRef,
}: EndSubButtonContainerProps) => {
  return (
    <HStack spacing={14} justifyContent="flex-end" mx="12" id="end_sub_buttons">
      {isPlayingMode && (
        <EndSubButton
          retryMode="practice"
          isRetryAlert={Boolean(isDisplayRankingButton && state.status !== 200)}
        />
      )}

      <EndSubButton
        retryMode={gameStateRef.current!.playMode}
        isRetryAlert={Boolean(isDisplayRankingButton && state.status !== 200)}
      />
    </HStack>
  );
};

export default EndSubButtonContainer;
