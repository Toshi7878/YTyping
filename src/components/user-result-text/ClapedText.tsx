import { LocalClapState, ThemeColors } from "@/types";
import { Text, useTheme } from "@chakra-ui/react";

interface ClapedTextProps {
  clapOptimisticState: LocalClapState;
}

const ClapedText = (props: ClapedTextProps) => {
  const theme: ThemeColors = useTheme();
  return (
    <Text
      as="span"
      {...(props.clapOptimisticState.hasClap && { color: theme.colors.semantic.clap })}
      className={`${props.clapOptimisticState.hasClap ? "outline-text" : ""}`}
    >
      {props.clapOptimisticState.clapCount}
    </Text>
  );
};

export default ClapedText;
