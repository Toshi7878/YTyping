import { usePlayingNotifyAtom, useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Badge, HStack, Kbd, useTheme } from "@chakra-ui/react";
import styled from "@emotion/styled";

import { useAtomValue } from "jotai";

interface PlayingBottomBadgeProps {
  badgeText: string;
  kbdText: string;
  isPauseDisabled: boolean;
  isKbdHidden: boolean;
  onClick: () => void;
}
const StyledKbd = styled(Kbd)<{ isDisabled: boolean; isKbdHidden: boolean }>`
  cursor: ${(props) => (props.isDisabled ? "not-allowed" : "pointer")};
  visibility: ${(props) => (props.isKbdHidden ? "hidden" : "visible")};
  transition: transform 0.1s ease-in-out;

  &:hover {
    ${(props) =>
      !props.isDisabled &&
      `
  transform: scale(1.20);
`}
  }
`;

const StyledBadge = styled(Badge)<{ isDisabled: boolean; isKbdHidden: boolean }>`
  cursor: ${(props) =>
    props.isDisabled ? "not-allowed" : props.isKbdHidden ? "initial" : "pointer"};
  transition: transform 0.1s ease-in-out;

  &:hover {
    ${(props) =>
      !props.isDisabled && !props.isKbdHidden
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
        isDisabled={isDisabled}
        isKbdHidden={props.isKbdHidden}
        fontSize="lg"
        as="button"
        className="bottom-card-badge"
        onClick={isDisabled || props.isKbdHidden ? undefined : props.onClick}
        borderRadius="3xl"
        opacity={isDisabled ? 0.5 : 1}
        bg={theme.colors.background.card}
        color={"color"}
        borderWidth="1px"
        borderStyle="solid"
        borderColor={theme.colors.border.card}
      >
        {props.badgeText}
      </StyledBadge>
      <StyledKbd
        isDisabled={isDisabled}
        isKbdHidden={props.isKbdHidden}
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
