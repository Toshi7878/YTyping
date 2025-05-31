"use client";
import { Box, Flex } from "@chakra-ui/react";
import LeftNav from "./child/left-child/LeftNav";
import RightNav from "./child/RightNav";
const HeaderContent = () => {
  return (
    <Box as="header" id="header" position="fixed" zIndex={40} bg={"background.header"} width="100vw">
      <Flex
        as="nav"
        width={{ base: "90%", xl: "80%" }}
        className="max-w-screen-2xl"
        mx="auto"
        height={10}
        alignItems="center"
        justifyContent="space-between"
      >
        <LeftNav />
        <RightNav />
      </Flex>
    </Box>
  );
};

export default HeaderContent;
