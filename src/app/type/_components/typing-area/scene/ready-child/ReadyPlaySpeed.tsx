import { useSceneAtom, useTypePageSpeedAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, HStack, Text, useTheme } from "@chakra-ui/react";
import React, { useEffect } from "react";
import SpeedChangeButton from "./child/SpeedChangeButton";

interface ReadyPlaySpeedProps {
  speedUpButtonRef: React.RefObject<HTMLButtonElement>;
  speedDownButtonRef: React.RefObject<HTMLButtonElement>;
}
const ReadyPlaySpeed = (props: ReadyPlaySpeedProps) => {
  const speedData = useTypePageSpeedAtom();
  const scene = useSceneAtom();
  const { gameStateRef } = useRefs();
  const theme: ThemeColors = useTheme();

  useEffect(() => {
    if (scene === "ready") {
      if (speedData.defaultSpeed < 1) {
        gameStateRef.current!.playMode = "practice";
      } else {
        gameStateRef.current!.playMode = "playing";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speedData.defaultSpeed, scene]);

  return (
    <HStack
      borderColor={theme.colors.border.card}
      border="1px solid"
      px={8}
      py={{ base: 6, md: 3 }}
      className="rounded-lg"
      boxShadow="md"
    >
      <CustomToolTip
        label="1.00倍速未満の場合は練習モードになります。"
        placement="top"
        isDisabled={speedData.defaultSpeed > 1}
      >
        <SpeedChangeButton
          buttonRef={props.speedDownButtonRef}
          buttonLabel={{ text: "-", key: "F9" }}
          type="down"
        />
      </CustomToolTip>

      <Box fontWeight="bold" mx={8} fontSize={{ base: "3rem", md: "4xl" }}>
        <Text as="span" id="speed">
          {speedData.defaultSpeed.toFixed(2)}
        </Text>
        倍速
      </Box>

      <SpeedChangeButton
        buttonRef={props.speedUpButtonRef}
        buttonLabel={{ text: "+", key: "F10" }}
        type="up"
      />
    </HStack>
  );
};

export default ReadyPlaySpeed;
