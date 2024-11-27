import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { Box, Button, HStack, Text, useTheme } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { ThemeColors } from "@/types";
import { useTypePageSpeedAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useVideoSpeedChange } from "@/app/type/hooks/useVideoSpeedChange";

interface ReadyPlaySpeedProps {
  speedUpButtonRef: React.RefObject<HTMLButtonElement>;
  speedDownButtonRef: React.RefObject<HTMLButtonElement>;
}
const ReadyPlaySpeed = (props: ReadyPlaySpeedProps) => {
  const speedData = useTypePageSpeedAtom();
  const { defaultSpeedChange } = useVideoSpeedChange();
  const { gameStateRef } = useRefs();
  const theme: ThemeColors = useTheme();

  useEffect(() => {
    if (speedData.defaultSpeed < 1) {
      gameStateRef.current!.playMode = "practice";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speedData.defaultSpeed]);

  return (
    <HStack
      borderColor={theme.colors.border.card}
      border="1px solid"
      px={8}
      className="rounded-lg"
      boxShadow="md"
    >
      <CustomToolTip
        tooltipLabel="1.00倍速未満の場合は練習モードになります。"
        placement="top"
        isDisabled={speedData.defaultSpeed > 1}
      >
        <Box>
          <Button
            variant="link"
            colorScheme="cyan"
            ref={props.speedDownButtonRef}
            style={{ textDecoration: "none" }} // 下線非表示
            onClick={() => defaultSpeedChange("down")}
          >
            <Box position="relative" fontSize="3xl" top="4px">
              -
              <Text as="small" className="f-key">
                F9
              </Text>
            </Box>
          </Button>
        </Box>
      </CustomToolTip>

      <Box fontWeight="bold" mx={8} fontSize="4xl">
        <Text as="span" id="speed">
          {speedData.defaultSpeed.toFixed(2)}
        </Text>
        倍速
      </Box>

      <Box>
        <Button
          variant="link"
          colorScheme="cyan"
          ref={props.speedUpButtonRef}
          style={{ textDecoration: "none" }} // 下線非表示
          onClick={() => defaultSpeedChange("up")}
        >
          <Box position="relative" fontSize="3xl" top="4px">
            +
            <Text as="small" className="f-key">
              F10
            </Text>
          </Box>
        </Button>
      </Box>
    </HStack>
  );
};

export default ReadyPlaySpeed;
