"use client";
import { INITIAL_STATE } from "@/config/global-consts";
import { useLocalClapServerActions } from "@/lib/global-hooks/useLocalClapServerActions";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useFormState } from "react-dom";
import { FaHandsClapping } from "react-icons/fa6";
interface ResultClapButtonProps {
  resultId?: number;
  clapCount?: number;
  hasClap?: boolean;
}

function ResultClapButton({ resultId = 0, clapCount = 0, hasClap = false }: ResultClapButtonProps) {
  const theme: ThemeColors = useTheme();
  const { data: session } = useSession();

  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap,
    clapCount,
  });

  const [state, formAction] = useFormState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);

  return (
    <Box
      as="form"
      action={session ? formAction : () => {}}
      display="inline-flex"
      visibility={resultId ? "visible" : "hidden"}
    >
      <Button
        mx={5}
        px={7}
        rounded={50}
        background={clapOptimisticState.hasClap ? `${theme.colors.semantic.clap}34` : "transparent"}
        {...(session && {
          _hover: {
            bg: `${theme.colors.semantic.clap}34`,
            color: theme.colors.semantic.clap,
          },
        })}
        color={clapOptimisticState.hasClap ? theme.colors.semantic.clap : "white"}
        cursor={session ? "pointer" : "default"}
        borderColor={theme.colors.border.card}
        border={"1px"}
        size="sm"
        variant={session ? "" : "unstyled"}
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
