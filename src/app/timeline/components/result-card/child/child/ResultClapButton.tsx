"use client";
import { INITIAL_STATE } from "@/config/global-consts";
import { useLocalClapServerActions } from "@/lib/global-hooks/useLocalClapServerActions";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";
import { useFormState } from "react-dom";
import { FaHandsClapping } from "react-icons/fa6";
interface ResultClapButtonProps {
  resultId: number;
  clapCount: number;
  hasClap: boolean;
}

function ResultClapButton({ resultId, clapCount, hasClap }: ResultClapButtonProps) {
  const theme: ThemeColors = useTheme();

  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap,
    clapCount,
  });

  const [state, formAction] = useFormState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);

  return (
    <Box as="form" action={formAction} display="inline-flex">
      <Button
        mx={5}
        px={7}
        rounded={50}
        background={clapOptimisticState.hasClap ? `${theme.colors.semantic.clap}34` : "transparent"}
        _hover={{
          bg: `${theme.colors.semantic.clap}34`,
          color: theme.colors.semantic.clap,
        }}
        color={clapOptimisticState.hasClap ? theme.colors.semantic.clap : "white"}
        cursor="pointer"
        borderColor={theme.colors.border.card}
        border={"1px"}
        size="sm"
        type="submit"
      >
        <Flex alignItems="center" letterSpacing={1}>
          <FaHandsClapping />
          <Text as="span" ml={1}>
            ×{clapOptimisticState.clapCount}
          </Text>
        </Flex>
      </Button>
    </Box>
  );
}

export default ResultClapButton;
