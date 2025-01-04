import { ResultCardInfo } from "@/app/timeline/ts/type";
import ClearRateText from "@/components/user-result-text/ClearRateText";
import { UserInputModeText } from "@/components/user-result-text/UserInputModeText";
import { ThemeColors } from "@/types";
import { Flex, Stack, Text, useTheme, VStack } from "@chakra-ui/react";
import ResultBadge from "./child/ResultBadge";

interface ResultCardProps {
  result?: ResultCardInfo;
}

export const MapResultBadges = ({ result }: ResultCardProps) => {
  const isPerfect = result?.miss === 0 && result?.lost === 0;
  const theme: ThemeColors = useTheme();

  const rankColor = result?.rank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <VStack align="end" mr={5} spacing={5} visibility={result ? "visible" : "hidden"}>
      <Stack direction="row" mb={2}>
        <ResultBadge color={rankColor} letterSpacing={1} borderColor={theme.colors.border.badge}>
          {result && (
            <UserInputModeText
              romaType={result.romaType}
              kanaType={result.kanaType}
              flickType={result.flickType}
            />
          )}
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1.5}
          borderColor={theme.colors.border.badge}
        >
          {result?.score}
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1}
          borderColor={theme.colors.border.badge}
        >
          <ClearRateText clearRate={result?.clearRate ?? 0} isPerfect={isPerfect} />
        </ResultBadge>
      </Stack>
      <Stack direction="row">
        <ResultBadge color={theme.colors.text.body} borderColor={theme.colors.border.badge}>
          {result && result.defaultSpeed.toFixed(2)}
          <Text as="span" ml={1} letterSpacing={2}>
            倍速
          </Text>
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1}
          borderColor={theme.colors.border.badge}
        >
          {result && result.kpm}
          <Text as="span" ml={1} letterSpacing={2}>
            kpm
          </Text>
        </ResultBadge>
      </Stack>
    </VStack>
  );
};

export const MapResultBadgesMobile = ({ result }: ResultCardProps) => {
  const isPerfect = result?.miss === 0 && result.lost === 0;
  const theme: ThemeColors = useTheme();

  const rankColor = result?.rank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <Flex justifyContent="space-around" width="100%" visibility={result ? "visible" : "hidden"}>
      <VStack align="end" mr={5} spacing={5}>
        <ResultBadge letterSpacing={1} color={rankColor} borderColor={theme.colors.border.badge}>
          Rank: #{result?.rank ?? 0}
        </ResultBadge>
        <ResultBadge
          letterSpacing={1}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          {result && (
            <UserInputModeText
              romaType={result.romaType}
              kanaType={result.kanaType}
              flickType={result.flickType}
            />
          )}
        </ResultBadge>
      </VStack>
      <VStack align="end" mr={5} spacing={5}>
        <ResultBadge
          letterSpacing={1.5}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          {result?.score ?? 0}
        </ResultBadge>
        <ResultBadge
          letterSpacing={1}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          {result?.kpm ?? 0}
          <Text as="span" ml={1} letterSpacing={2}>
            kpm
          </Text>
        </ResultBadge>
      </VStack>
      <VStack align="end" mr={5} spacing={5}>
        <ResultBadge
          letterSpacing={1}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          <ClearRateText clearRate={result?.clearRate ?? 0} isPerfect={isPerfect} />
        </ResultBadge>
        <ResultBadge color={theme.colors.text.body} borderColor={theme.colors.border.badge}>
          {result && result.defaultSpeed.toFixed(2)}
          <Text as="span" ml={1} letterSpacing={2}>
            倍速
          </Text>
        </ResultBadge>
      </VStack>
    </Flex>
  );
};
