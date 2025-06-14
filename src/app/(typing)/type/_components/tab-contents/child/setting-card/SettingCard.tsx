import { useGameUtilityReferenceParams } from "@/app/(typing)/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsStateRef } from "@/app/(typing)/type/atoms/stateAtoms";
import { useTRPC } from "@/trpc/trpc";
import { ThemeColors } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import {
  useBreakpointValue,
  useTheme,
} from "@chakra-ui/react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  const trpc = useTRPC();
  const updateTypingOptions = useMutation(trpc.userTypingOption.updateTypeOptions.mutationOptions());
  const breakpoint = useBreakpointValue({ base: "base", md: "md" });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
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
          writeGameUtilRefParams({ isOptionEdited: false });
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
          className="absolute z-[4] w-[600px] text-lg shadow-lg rounded-md overflow-hidden"
          style={{
            backgroundColor: theme.colors.background.body,
            color: theme.colors.text.body,
            borderColor: theme.colors.border.card,
            top: "2.5rem",
            right: 0,
          }}
        >
          <CardContent className="p-4">
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {tabData.map((tab, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabData.map((tab, index) => (
                <TabsContent key={index} value={index.toString()} className="px-2">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsResetModalOpen(true)}
              className="mt-4 ml-auto block text-destructive hover:bg-destructive/10"
            >
              設定をリセット
            </Button>
            <ResetSettingModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
          </CardContent>
        </Card>
      )}
    </>
  );
};

const SettingCardDivider = () => {
  const theme: ThemeColors = useTheme();
  return <Separator className="my-4" style={{ backgroundColor: theme.colors.text.body }} />;
};

interface ResetSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetSettingModal = ({ isOpen, onClose }: ResetSettingModalProps) => {
  const theme: ThemeColors = useTheme();
  const toast = useCustomToast();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        id="reset-setting-modal"
        style={{
          backgroundColor: theme.colors.background.body,
          color: theme.colors.text.body
        }}
      >
        <DialogHeader>
          <DialogTitle>設定のリセット</DialogTitle>
          <DialogDescription>
            すべての設定をデフォルトにリセットしますか？この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleResetOptions}>
            リセット
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SettingCard;
