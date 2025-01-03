import { usePlayingNotifyAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Badge, HStack, Kbd, useTheme } from "@chakra-ui/react";
import styled from "@emotion/styled";

interface PlayingLineSeekBadgeProps {
  badgeText: string;
  kbdTextPrev: string;
  kbdTextNext: string;
  onClick: () => void;
  onClickPrev: () => void;
  onClickNext: () => void;
}

const StyledKbd = styled(Kbd)<{ $isDisabled: boolean }>`
  cursor: ${(props) => (props.$isDisabled ? "not-allowed" : "pointer")};
  transition: transform 0.1s ease-in-out;

  &:hover {
    ${(props) =>
      !props.$isDisabled &&
      `
      transform: scale(1.20);
    `}
  }
`;

const PlayingLineSeekBadge = function (props: PlayingLineSeekBadgeProps) {
  const notify = usePlayingNotifyAtom();

  const isDisabled = notify.description === "ll";
  const theme: ThemeColors = useTheme();

  return (
    <HStack>
      <StyledKbd
        fontSize="xl"
        onClick={isDisabled ? undefined : props.onClickPrev}
        $isDisabled={isDisabled}
        isDisabled={isDisabled} // $isDisabled から isDisabled に変更
        bg={theme.colors.background.body}
        color={theme.colors.text.body}
        className="bottom-card-kbd"
        borderColor={theme.colors.border.card}
        borderWidth="1px"
        borderStyle="solid"
        opacity={isDisabled ? 0.5 : 0.8}
      >
        {props.kbdTextPrev}
      </StyledKbd>
      <Badge
        py={1}
        px={4}
        fontSize="lg"
        borderRadius="3xl"
        opacity={isDisabled ? 0.5 : 1}
        bg={theme.colors.background.card}
        color={theme.colors.text.body}
        className="bottom-card-badge"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={theme.colors.border.card}
        onClick={isDisabled ? undefined : props.onClick}
      >
        {props.badgeText}
      </Badge>
      <StyledKbd
        fontSize="xl"
        onClick={isDisabled ? undefined : props.onClickNext}
        $isDisabled={isDisabled}
        isDisabled={isDisabled}
        bg={theme.colors.background.body}
        color={theme.colors.text.body}
        className="bottom-card-kbd"
        borderColor={theme.colors.border.card}
        borderWidth="1px"
        borderStyle="solid"
        opacity={isDisabled ? 0.5 : 0.8}
      >
        {props.kbdTextNext}
      </StyledKbd>
    </HStack>
  );
};

PlayingLineSeekBadge.displayName = "PlayingLineSeekBadge";

export default PlayingLineSeekBadge;
