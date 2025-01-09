import { ThemeColors } from "@/types";
import { Text, useTheme } from "@chakra-ui/react";
import React from "react";

interface RankTextProps {
  rank: number;
  children: React.ReactNode;
}

const RankText = (props: RankTextProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Text
      as="span"
      ml={1}
      {...(props.rank === 1 && { color: theme.colors.semantic.perfect })}
      className={`${props.rank === 1 ? "outline-text" : ""}`}
    >
      {props.children}
    </Text>
  );
};

export default RankText;
