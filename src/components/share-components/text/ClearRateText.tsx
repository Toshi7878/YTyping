import { ThemeColors } from "@/types";
import { Text, useTheme } from "@chakra-ui/react";
import React from "react";

interface ClearRateTextProps {
  isPerfect: boolean;
  clearRate: number;
}

const ClearRateText = (props: ClearRateTextProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Text
      as="span"
      {...(props.isPerfect && { color: theme.colors.semantic.perfect })}
      className={`${props.isPerfect ? "outline-text" : ""}`}
    >
      {props.clearRate.toFixed(1)}%
    </Text>
  );
};

export default ClearRateText;
