"use client";
import { ThemeColors } from "@/types";
import { Heading, useTheme } from "@chakra-ui/react";

const ContentHeading = () => {
  const theme: ThemeColors = useTheme();
  return (
    <Heading as="h2" size="lg" mb={4} color={theme.colors.text.body}>
      更新履歴
    </Heading>
  );
};

export default ContentHeading;
