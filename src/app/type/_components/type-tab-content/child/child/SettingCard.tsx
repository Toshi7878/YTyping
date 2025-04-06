import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsStateRef } from "@/app/type/atoms/stateAtoms";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Card,
  CardBody,
  Divider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useBreakpointValue,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import { Dispatch, useEffect, useRef } from "react";
import UserLineCompletedRadioButton from "./child/UserLineCompletedRadioButton";
import UserNextDisplayRadioButton from "./child/UserNextDisplayRadioButton";
import UserShortcutKeyCheckbox from "./child/UserShortcutKeyCheckbox";
import UserSoundEffectCheckbox from "./child/UserSoundEffectCheckbox";
import UserTimeOffsetChange from "./child/UserTimeOffsetChange";
import { UserWordFontSize } from "./child/UserWordFontSize";
import { UserWordScrollChange } from "./child/UserWordScrollChange";

interface SettingCardProps {
  isCardVisible: boolean;
  setIsCardVisible: Dispatch<boolean>;
}

const SettingCard = (props: SettingCardProps) => {
  const theme: ThemeColors = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const updateTypingOptions = clientApi.userTypingOption.update.useMutation();
  const breakpoint = useBreakpointValue({ base: "base", md: "md" });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { writeGameUtils } = useGameUtilsRef();
  const readUserTypingOptions = useUserTypingOptionsStateRef();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.parentElement?.id !== "option_icon" &&
        cardRef.current &&
        !cardRef.current.contains(target) &&
        target.closest("#reset-setting-modal-overlay") === null
      ) {
        props.setIsCardVisible(false);

        const isOptionEdited = readUserTypingOptions();
        if (isOptionEdited) {
          const userOptions = readUserTypingOptions();
          updateTypingOptions.mutate(userOptions);
          writeGameUtils({ isOptionEdited: false });
        }
      }
    };

    if (props.isCardVisible) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isCardVisible]);

  const tabData = [
    {
      label: "メイン設定",
      content: (
        <>
          <UserTimeOffsetChange />
          <SettingCardDivider />
          <UserSoundEffectCheckbox />
        </>
      ),
    },
    {
      label: "表示設定",
      content: (
        <>
          <UserNextDisplayRadioButton />
          <SettingCardDivider />
          <UserLineCompletedRadioButton />
          <SettingCardDivider />
          <UserWordFontSize />
          {breakpoint === "md" && (
            <>
              <SettingCardDivider />
              <UserWordScrollChange />
            </>
          )}
        </>
      ),
    },
    { label: "キーボード設定", content: <UserShortcutKeyCheckbox /> },
  ];

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
          fontSize={"lg"}
          boxShadow="lg"
          borderRadius="md"
          overflow="hidden"
        >
          <CardBody padding={4}>
            <Tabs variant="soft-rounded">
              <TabList mb={4} gap={2} sx={{ display: "flex", flexWrap: "wrap" }}>
                {tabData.map((tab, index) => (
                  <Tab
                    key={index}
                    _selected={{
                      bg: theme.colors.primary.main,
                      color: theme.colors.text.body,
                    }}
                    _hover={{
                      bg: theme.colors.primary.light,
                      color: theme.colors.text.body,
                    }}
                    border={`1px solid ${theme.colors.border.card}`}
                    color={theme.colors.text.body}
                    rounded="md"
                    bg={theme.colors.background.card}
                  >
                    {tab.label}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {tabData.map((tab, index) => (
                  <TabPanel key={index} px={2}>
                    {tab.content}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>

            <Button
              mt={4}
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={onOpen}
              alignSelf="flex-end"
              display="block"
              ml="auto"
            >
              設定をリセット
            </Button>
            <ResetSettingModal isOpen={isOpen} onClose={onClose} />
          </CardBody>
        </Card>
      )}
    </>
  );
};

const SettingCardDivider = () => {
  const theme: ThemeColors = useTheme();
  return <Divider bg={theme.colors.text.body} my={4} />;
};

interface ResetSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetSettingModal = ({ isOpen, onClose }: ResetSettingModalProps) => {
  const theme: ThemeColors = useTheme();
  const toast = useCustomToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { resetUserTypingOptions } = useSetUserTypingOptionsState();

  const handleResetOptions = () => {
    resetUserTypingOptions();
    toast({
      title: "設定をリセットしました",
      type: "success",
    });
    onClose();
  };
  return (
    <AlertDialog id="reset-setting-modal" isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay id="reset-setting-modal-overlay">
        <AlertDialogContent bg={theme.colors.background.body} color={theme.colors.text.body}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            設定のリセット
          </AlertDialogHeader>
          <AlertDialogBody>すべての設定をデフォルトにリセットしますか？この操作は元に戻せません。</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="red" onClick={handleResetOptions} ml={3}>
              リセット
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
export default SettingCard;
