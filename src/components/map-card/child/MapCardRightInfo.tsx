"use client";
import { Flex } from "@chakra-ui/react";

interface MapCardProps {
  children: React.ReactNode;
}
function MapCardRightInfo({ children }: MapCardProps) {
  return (
    <Flex
      flexDirection="column"
      justifyContent="space-between"
      overflow="hidden"
      width="100%"
      height="100%"
      position="relative"
      fontSize={{ base: "xs", sm: "sm", md: "md", lg: "lg" }}
    >
      {children}
    </Flex>
  );
}

export default MapCardRightInfo;
