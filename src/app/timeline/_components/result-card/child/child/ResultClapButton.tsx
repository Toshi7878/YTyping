"use client";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { INITIAL_STATE } from "@/config/consts/globalConst";
import { ThemeColors } from "@/types";
import { useLocalClapServerActions } from "@/util/global-hooks/useLocalClapServerActions";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
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

  const [state, formAction] = useActionState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);

  return (
    <Box as="form" action={session ? formAction : () => {}} display="inline-flex">
      <CustomToolTip placement="top" isDisabled={!!session} label={"拍手はログイン後に可能です"}>
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
          disabled={!session}
          _disabled={{
            color: "gray.400",
          }}
          border={"1px"}
          size="sm"
          variant={"outline"}
          minWidth={100}
          type="submit"
        >
          <Flex alignItems="center" letterSpacing={1}>
            <FaHandsClapping />
            <Text as="span" ml={1}>
              ×{clapOptimisticState.clapCount}
            </Text>
          </Flex>
        </Button>
      </CustomToolTip>
    </Box>
  );
}

export default ResultClapButton;
