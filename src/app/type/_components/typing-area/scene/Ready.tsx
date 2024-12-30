import { Box, Flex, Stack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import ReadyInputModeRadioCards from "./ready-child/ReadyInputModeRadioCards";
import ReadyPlaySpeed from "./ready-child/ReadyPlaySpeed";
import "../../../style/fKey.scss";
import ReadyPracticeButton from "./ready-child/ReadyPracticeButton";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { CARD_BODY_MIN_HEIGHT } from "../TypingCard";
import { useMapAtom } from "@/app/type/type-atoms/gameRenderAtoms";

function Ready() {
  const { playerRef } = useRefs();
  const speedUpButtonRef = useRef<HTMLButtonElement>(null);
  const speedDownButtonRef = useRef<HTMLButtonElement>(null);
  const map = useMapAtom();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Enter":
          if (playerRef.current && map) {
            playerRef.current.playVideo();
          }
          event.preventDefault();
          break;
        case "F9":
          speedDownButtonRef.current?.click();
          event.preventDefault();

          break;
        case "F10":
          speedUpButtonRef.current?.click();
          event.preventDefault();

          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRef, map]);

  return (
    <Stack justifyContent="space-between" direction="column" minH={CARD_BODY_MIN_HEIGHT}>
      <Box fontWeight="bold" fontSize="2xl">
        Enterキー / 動画をクリックして開始
      </Box>
      <Flex textAlign="center" fontSize="3xl" justifyContent="center">
        <ReadyInputModeRadioCards />
      </Flex>
      <Flex textAlign="center" justifyContent="space-between">
        <ReadyPlaySpeed
          speedUpButtonRef={speedUpButtonRef}
          speedDownButtonRef={speedDownButtonRef}
        />
        <ReadyPracticeButton />
      </Flex>
    </Stack>
  );
}

export default Ready;
