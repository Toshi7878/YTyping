"use client";
import { Box, Flex } from "@chakra-ui/react";
import LeftNav from "./child/left-child/LeftNav";
import RightNav from "./child/RightNav";
import HamburgerMenu from "./hamburger-menu/HamburgerMenu";

interface HeaderContentProps {
  isNewNotification: boolean;
}

const HeaderContent = ({ isNewNotification }: HeaderContentProps) => {
  return (
    <Box
      as="header"
      id="header"
      position="fixed"
      zIndex={40}
      bg={"background.header"}
      width="100vw"
    >
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
        <RightNav display={{ base: "none", md: "flex" }} isNewNotification={isNewNotification} />
        <HamburgerMenu
          display={{ base: "flex", md: "none" }}
          isNewNotification={isNewNotification}
        />
      </Flex>
    </Box>
  );
};

export default HeaderContent;
