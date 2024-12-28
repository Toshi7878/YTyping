import {
  isOptionEditedAtom,
  userOptionsAtom,
  useSetIsOptionEdited,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import VolumeRange from "@/components/custom-ui/VolumeRange";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Card, CardBody, Divider, useTheme } from "@chakra-ui/react";
import { useStore } from "jotai";
import { Dispatch, useEffect, useRef } from "react";
import UserNextDisplayRadioButton from "./child/UserNextDisplayRadioButton";
import UserShortcutKeyCheckbox from "./child/UserShortcutKeyCheckbox";
import UserSoundEffectCheckbox from "./child/UserSoundEffectCheckbox";
import UserTimeOffsetChange from "./child/UserTimeOffsetChange";

interface SettingCardProps {
  isCardVisible: boolean;
  setIsCardVisible: Dispatch<boolean>;
}

const SettingCard = (props: SettingCardProps) => {
  const { playerRef } = useRefs();
  const theme: ThemeColors = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const typeAtomStore = useStore();
  const updateTypingOptions = clientApi.userOption.update.useMutation();

  const setIsOptionEdited = useSetIsOptionEdited();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.parentElement?.id !== "option_icon" &&
        cardRef.current &&
        !cardRef.current.contains(target)
      ) {
        props.setIsCardVisible(false);
        const isOptionEdited = typeAtomStore.get(isOptionEditedAtom);
        if (isOptionEdited) {
          const userOptions = typeAtomStore.get(userOptionsAtom);
          updateTypingOptions.mutate(userOptions);
          setIsOptionEdited(false);
        }
      }
    };

    if (props.isCardVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isCardVisible]);

  return (
    <>
      {props.isCardVisible && (
        <Card
          ref={cardRef}
          position="absolute"
          zIndex={4}
          width={"600px"}
          bg={theme.colors.background.body}
          color={theme.colors.text.body}
          border="1px"
          top={10}
          right={0}
          borderColor={theme.colors.border.card}
        >
          <CardBody>
            {!isIOS && !isAndroid && <VolumeRange playerRef={playerRef} />}
            {!isIOS && !isAndroid && <Divider bg={theme.colors.text.body} my={3} />}
            <UserTimeOffsetChange />
            <Divider bg={theme.colors.text.body} my={3} />
            <UserSoundEffectCheckbox />
            <Divider bg={theme.colors.text.body} my={3} />
            <UserNextDisplayRadioButton />
            <Divider bg={theme.colors.text.body} my={3} />
            <UserShortcutKeyCheckbox />
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default SettingCard;
