"use client";
import { useSpeedAtom, useSpeedReducer } from "@/app/edit/edit-atom/editAtom";
import "@/app/edit/style/editor.scss";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

const EditSpeedChange = () => {
  const speed = useSpeedAtom(); //0.25 or 2.00 場合片方のボタンをdisabledにする
  const speedReducer = useSpeedReducer();

  return (
    <HStack justify="center" className="w-[170px]">
      <Box>
        <Button cursor="pointer" variant="unstyled" onClick={() => speedReducer("down")}>
          <Box className="relative">
            -
            <Text as="span" className="f-key">
              F9
            </Text>
          </Box>
        </Button>
      </Box>
      <Box>
        <Text as="span" id="speed">
          {speed.toFixed(2)}
        </Text>
        倍速
      </Box>
      <Box>
        <Button variant="unstyled" cursor="pointer" onClick={() => speedReducer("up")}>
          <Box className="relative">
            +
            <Text as="span" className="f-key">
              F10
            </Text>
          </Box>
        </Button>
      </Box>
    </HStack>
  );
};

export default EditSpeedChange;
