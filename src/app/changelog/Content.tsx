"use client";
import { ThemeColors } from "@/types";
import { Flex, Text, useTheme } from "@chakra-ui/react";
import ContentHeading from "./_components/Heading";
import UpdateHistory from "./_components/UpdateHistory";

interface ContentProps {
  buildingDate: Date | null;
}

const Content = ({ buildingDate }: ContentProps) => {
  const theme: ThemeColors = useTheme();
  return (
    <Flex flexDirection="column" as="article" gap={4}>
      <Text fontSize="sm" color={theme.colors.text.body}>
        最終更新: {buildingDate?.toLocaleString()}
      </Text>
      <ContentHeading />
      <UpdateHistory />
    </Flex>
  );
};

export default Content;
