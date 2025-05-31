import { usePlayer } from "@/app/(typing)/type/atoms/refAtoms";
import { useMapState } from "@/app/(typing)/type/atoms/stateAtoms";
import { CARD_BODY_MIN_HEIGHT } from "@/app/(typing)/type/ts/const/consts";
import { useWindowFocus } from "@/util/global-hooks/windowFocus";
import { Box, Flex, Stack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import "../../../style/fKey.scss";
import ReadyInputModeRadioCards from "./ready-child/ReadyInputModeRadioCards";
import ReadyPlaySpeed from "./ready-child/ReadyPlaySpeed";
import ReadyPracticeButton from "./ready-child/ReadyPracticeButton";

function Ready() {
  const speedUpButtonRef = useRef<HTMLButtonElement>(null);
  const speedDownButtonRef = useRef<HTMLButtonElement>(null);
  const map = useMapState();
  const windowFocus = useWindowFocus();
  const { readPlayer } = usePlayer();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      switch (event.code) {
        case "Enter":
          const player = readPlayer();
          if (player && map) {
            player.playVideo();
            windowFocus();
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
  }, [readPlayer(), map]);

  return (
    <Stack justifyContent="space-between" direction="column" minH={CARD_BODY_MIN_HEIGHT}>
      <Box fontWeight="bold" fontSize={{ base: "2.5rem", md: "2xl" }} userSelect="none">
        Enterキー / 動画をクリックして開始
      </Box>
      <Flex textAlign="center" fontSize="3xl" justifyContent="center">
        <ReadyInputModeRadioCards />
      </Flex>
      <Flex textAlign="center" justifyContent="space-between">
        <ReadyPlaySpeed speedUpButtonRef={speedUpButtonRef as any} speedDownButtonRef={speedDownButtonRef as any} />
        <ReadyPracticeButton />
      </Flex>
    </Stack>
  );
}

export default Ready;
