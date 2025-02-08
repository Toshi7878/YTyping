import { ResultCardInfo } from "@/app/timeline/ts/type";
import ClearRateText from "@/components/share-components/text/ClearRateText";
import { UserInputModeText } from "@/components/share-components/text/UserInputModeText";
import { ThemeColors } from "@/types";
import { Flex, FlexProps, Stack, Text, useTheme, VStack } from "@chakra-ui/react";
import ResultBadge from "./child/ResultBadge";

interface ResultCardProps {
  result?: ResultCardInfo;
}

export const MapResultBadges = ({ result }: ResultCardProps) => {
  const isPerfect = result?.status.miss === 0 && result?.status.lost === 0;
  const theme: ThemeColors = useTheme();

  const rankColor = result?.rank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <VStack align="end" mr={5} spacing={5} visibility={result ? "visible" : "hidden"}>
      <Stack direction="row" mb={2}>
        <ResultBadge color={rankColor} letterSpacing={1} borderColor={theme.colors.border.badge}>
          {result && (
            <UserInputModeText
              romaType={result.status.roma_type}
              kanaType={result.status.kana_type}
              flickType={result.status.flick_type}
              englishType={result.status.english_type}
              symbolType={result.status.symbol_type}
              numType={result.status.num_type}
              spaceType={result.status.space_type}
            />
          )}
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1.5}
          borderColor={theme.colors.border.badge}
        >
          {result?.status.score}
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1}
          borderColor={theme.colors.border.badge}
        >
          <ClearRateText clearRate={result?.status.clear_rate ?? 0} isPerfect={isPerfect} />
        </ResultBadge>
      </Stack>
      <Stack direction="row">
        <ResultBadge color={theme.colors.text.body} borderColor={theme.colors.border.badge}>
          {result && result.status.default_speed.toFixed(2)}
          <Text as="span" ml={1} letterSpacing={2}>
            倍速
          </Text>
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1}
          borderColor={theme.colors.border.badge}
        >
          {result && result.status.kpm}
          <Text as="span" ml={1} letterSpacing={2}>
            kpm
          </Text>
        </ResultBadge>
      </Stack>
    </VStack>
  );
};

export const MapResultBadgesMobile = ({ result, ...rest }: ResultCardProps & FlexProps) => {
  const isPerfect = result?.status.miss === 0 && result.status.lost === 0;
  const theme: ThemeColors = useTheme();

  const rankColor = result?.rank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <Flex
      justifyContent="space-around"
      width="100%"
      visibility={result ? "visible" : "hidden"}
      {...rest}
    >
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
              romaType={result.status.roma_type}
              kanaType={result.status.kana_type}
              flickType={result.status.flick_type}
              englishType={result.status.english_type}
              symbolType={result.status.symbol_type}
              numType={result.status.num_type}
              spaceType={result.status.space_type}
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
          {result?.status.score ?? 0}
        </ResultBadge>
        <ResultBadge
          letterSpacing={1}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          {result?.status.kpm ?? 0}
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
          <ClearRateText clearRate={result?.status.clear_rate ?? 0} isPerfect={isPerfect} />
        </ResultBadge>
        <ResultBadge color={theme.colors.text.body} borderColor={theme.colors.border.badge}>
          {result && result.status.default_speed.toFixed(2)}
          <Text as="span" ml={1} letterSpacing={2}>
            倍速
          </Text>
        </ResultBadge>
      </VStack>
    </Flex>
  );
};
