"use client";
import { ThemeColors } from "@/types";
import { CardBody, useTheme } from "@chakra-ui/react";
import CustomMapCard from "../custom-ui/CustomMapCard";

interface ActiveUserMapCardProps {
  children: React.ReactNode;
}
function ActiveUserMapCard({ children }: ActiveUserMapCardProps) {
  const theme: ThemeColors = useTheme();

  return (
    <CustomMapCard>
      <CardBody
        color={theme.colors.text.body}
        bg={theme.colors.background.card}
        borderRadius="md"
        display="flex"
        alignItems="start"
        border="none"
        height="100%"
        p={0}
      >
        {children}
      </CardBody>
    </CustomMapCard>
  );
}

export default ActiveUserMapCard;
