import { PlayMode } from "@/app/type/ts/type";
import { UploadResult } from "@/types";
import { HStack } from "@chakra-ui/react";
import EndSubButton from "./child/EndSubButton";

interface EndSubButtonContainerProps {
  isPlayingMode: boolean;
  isDisplayRankingButton: boolean;
  state: UploadResult;
  playMode: PlayMode;
}

const EndSubButtonContainer = ({
  isPlayingMode,
  isDisplayRankingButton,
  state,
  playMode,
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
        retryMode={playMode}
        isRetryAlert={Boolean(isDisplayRankingButton && state.status !== 200)}
      />
    </HStack>
  );
};

export default EndSubButtonContainer;
