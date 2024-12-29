"use client";
import { ThemeColors } from "@/types";
import { CardBody, useTheme } from "@chakra-ui/react";
import CustomMapCard from "../custom-ui/CustomMapCard";

interface MapCardProps {
  children: React.ReactNode;
}
function MapCard({ children }: MapCardProps) {
  const theme: ThemeColors = useTheme();

  return (
    <CustomMapCard>
      <CardBody
        color={theme.colors.text.body}
        bg={theme.colors.background.card}
        borderRadius="md"
        display="flex"
        alignItems="start"
        style={{ padding: 0, border: "none" }}
      >
        {children}
      </CardBody>
    </CustomMapCard>
  );
}

export default MapCard;
