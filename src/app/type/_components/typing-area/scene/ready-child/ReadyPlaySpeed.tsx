import { usePlaySpeedState } from "@/app/type/atoms/reducerAtoms";
import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSceneState } from "@/app/type/atoms/stateAtoms";
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
  const speedData = usePlaySpeedState();
  const scene = useSceneState();
  const theme: ThemeColors = useTheme();
  const { writeGameUtils } = useGameUtilsRef();

  useEffect(
    () => {
      if (scene === "ready") {
        if (speedData.defaultSpeed < 1) {
          writeGameUtils({
            playMode: "practice",
          });
        } else {
          writeGameUtils({
            playMode: "playing",
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speedData.defaultSpeed, scene]
  );

  return (
    <CustomToolTip
      label="1.00倍速未満の場合は練習モードになります。"
      placement="top"
      isDisabled={speedData.defaultSpeed >= 1}
      isOpen={speedData.defaultSpeed < 1}
      top={3}
    >
      <HStack
        borderColor={theme.colors.border.card}
        border="1px solid"
        px={8}
        py={{ base: 6, md: 3 }}
        className="rounded-lg"
        boxShadow="md"
      >
        <SpeedChangeButton
          buttonRef={props.speedDownButtonRef}
          buttonLabel={{ text: "-", key: "F9" }}
          type="down"
        />

        <Box fontWeight="bold" mx={8} fontSize={{ base: "3rem", md: "4xl" }} userSelect="none">
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
    </CustomToolTip>
  );
};

export default ReadyPlaySpeed;
