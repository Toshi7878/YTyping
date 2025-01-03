import { usePlayingNotifyAtom, useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Badge, HStack, Kbd, useTheme } from "@chakra-ui/react";
import styled from "@emotion/styled";

interface PlayingBottomBadgeProps {
  badgeText: string;
  kbdText: string;
  isPauseDisabled: boolean;
  isKbdHidden: boolean;
  onClick: () => void;
}
const StyledKbd = styled(Kbd)<{ $disabled: boolean; $is_kbd_hidden: boolean }>`
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  visibility: ${(props) => (props.$is_kbd_hidden ? "hidden" : "visible")};
  transition: transform 0.1s ease-in-out;

  &:hover {
    ${(props) =>
      !props.$disabled &&
      `
  transform: scale(1.20);
`}
  }
`;

const StyledBadge = styled(Badge)<{ $disabled: boolean; $is_kbd_hidden: boolean }>`
  cursor: ${(props) =>
    props.$disabled ? "not-allowed" : props.$is_kbd_hidden ? "initial" : "pointer"};
  transition: transform 0.1s ease-in-out;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  &:hover {
    ${(props) =>
      !props.$disabled && !props.$is_kbd_hidden
        ? `
      transform: scale(1.05);
      `
        : ""}
  }
`;
const PlayingBottomBadge = function (props: PlayingBottomBadgeProps) {
  const notify = usePlayingNotifyAtom();
  const scene = useSceneAtom();
  const isDisabled = notify.description === "ll" && props.isPauseDisabled;
  const isHidden = scene === "ready" || scene === "end";
  const theme: ThemeColors = useTheme();

  return (
    <HStack hidden={isHidden}>
      <StyledBadge
        py={1}
        px={4}
        $disabled={isDisabled}
        isDisabled={isDisabled}
        $is_kbd_hidden={props.isKbdHidden}
        fontSize="lg"
        as="button"
        className="bottom-card-badge"
        onClick={isDisabled || props.isKbdHidden ? undefined : props.onClick}
        borderRadius="3xl"
        bg={theme.colors.background.card}
        color={"color"}
        borderWidth="1px"
        borderStyle="solid"
        borderColor={theme.colors.border.card}
      >
        {props.badgeText}
      </StyledBadge>
      <StyledKbd
        $disabled={isDisabled}
        isDisabled={isDisabled}
        $is_kbd_hidden={props.isKbdHidden}
        fontSize="xl"
        bg={"background"}
        color={"color"}
        borderColor={theme.colors.border.card}
        borderWidth="1px"
        borderStyle="solid"
        className="bottom-card-kbd"
        opacity={isDisabled ? 0.5 : 0.8}
        onClick={isDisabled ? undefined : props.onClick}
      >
        {props.kbdText}
      </StyledKbd>
    </HStack>
  );
};

PlayingBottomBadge.displayName = "PlayingBottomBadge";

export default PlayingBottomBadge;
