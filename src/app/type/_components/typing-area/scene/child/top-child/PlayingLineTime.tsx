import { Box, Text } from "@chakra-ui/react";
import React from "react";
import LineKpmText from "./child/LineKpmText";
import LineRemainTimeText from "./child/LineRemainTimeText";

const PlayingLineTime = () => {
  return (
    <Box fontSize="3xl">
      <LineKpmText />
      <Text as="span" ms={1} letterSpacing="1.5px">
        kpm
      </Text>
      <Text as="span" mx={3}>
        -
      </Text>
      残り
      <Text as="span" me={1}>
        <LineRemainTimeText />
      </Text>
      秒
    </Box>
  );
};

export default PlayingLineTime;
