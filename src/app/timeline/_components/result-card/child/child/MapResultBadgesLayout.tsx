import { ResultCardInfo } from "@/app/timeline/ts/type";
import ClearRateText from "@/components/user-result-text/ClearRateText";
import { UserInputModeText } from "@/components/user-result-text/UserInputModeText";
import { Stack, Text, useTheme, VStack } from "@chakra-ui/react";
import React from "react";
import ResultBadge from "./child/ResultBadge";
import { ThemeColors } from "@/types";

interface ResultCardProps {
  props: ResultCardInfo;
}

export const MapResultBadges = ({ props }: ResultCardProps) => {
  const isPerfect = props.miss === 0 && props.lost === 0;
  const theme: ThemeColors = useTheme();

  const rankColor = props.rank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <VStack align="end" mr={5} spacing={5}>
      <Stack direction="row" mb={2}>
        <ResultBadge color={rankColor} letterSpacing={1} borderColor={theme.colors.border.badge}>
          <UserInputModeText
            romaType={props.romaType}
            kanaType={props.kanaType}
            flickType={props.flickType}
          />
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1.5}
          borderColor={theme.colors.border.badge}
        >
          {props.score}
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1}
          borderColor={theme.colors.border.badge}
        >
          <ClearRateText clearRate={props.clearRate} isPerfect={isPerfect} />
        </ResultBadge>
      </Stack>
      <Stack direction="row">
        <ResultBadge color={theme.colors.text.body} borderColor={theme.colors.border.badge}>
          {props.defaultSpeed.toFixed(2)}
          <Text as="span" ml={1} letterSpacing={2}>
            倍速
          </Text>
        </ResultBadge>
        <ResultBadge
          color={theme.colors.text.body}
          letterSpacing={1}
          borderColor={theme.colors.border.badge}
        >
          {props.kpm}
          <Text as="span" ml={1} letterSpacing={2}>
            kpm
          </Text>
        </ResultBadge>
      </Stack>
    </VStack>
  );
};

export const MapResultBadgesMobile = ({ props }: ResultCardProps) => {
  const isPerfect = props.miss === 0 && props.lost === 0;
  const theme: ThemeColors = useTheme();

  const rankColor = props.rank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <>
      <VStack align="end" mr={5} spacing={5}>
        <ResultBadge letterSpacing={1} color={rankColor} borderColor={theme.colors.border.badge}>
          Rank: #{props.rank}
        </ResultBadge>
        <ResultBadge
          letterSpacing={1}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          <UserInputModeText
            romaType={props.romaType}
            kanaType={props.kanaType}
            flickType={props.flickType}
          />
        </ResultBadge>
      </VStack>
      <VStack align="end" mr={5} spacing={5}>
        <ResultBadge
          letterSpacing={1.5}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          {props.score}
        </ResultBadge>
        <ResultBadge
          letterSpacing={1}
          color={theme.colors.text.body}
          borderColor={theme.colors.border.badge}
        >
          {props.kpm}
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
          <ClearRateText clearRate={props.clearRate} isPerfect={isPerfect} />
        </ResultBadge>
        <ResultBadge color={theme.colors.text.body} borderColor={theme.colors.border.badge}>
          {props.defaultSpeed.toFixed(2)}
          <Text as="span" ml={1} letterSpacing={2}>
            倍速
          </Text>
        </ResultBadge>
      </VStack>
    </>
  );
};
