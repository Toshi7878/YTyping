import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import {
  useSetUserTypingOptionsState,
  useUserTypingOptionsState,
  useUserTypingOptionsStateRef,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LabeledRadioGroup, LabeledRadioItem } from "@/components/ui/radio-group/labeled-radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { useTRPC } from "@/trpc/trpc";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { $Enums } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import SettingIcon from "../icon-child/SettingIcon";
import UserShortcutKeyCheckbox from "./child/UserShortcutKeyCheckbox";
import UserSoundEffectCheckbox from "./child/UserSoundEffectCheckbox";
import UserTimeOffsetChange from "./child/UserTimeOffsetChange";
import { UserWordFontSize } from "./child/UserWordFontSize";
import { UserWordScrollChange } from "./child/UserWordScrollChange";

const SettingPopover = () => {
  const trpc = useTRPC();
  const updateTypingOptions = useMutation(trpc.userTypingOption.updateTypeOptions.mutationOptions());
  const { isMdScreen } = useBreakPoint();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readUserTypingOptions = useUserTypingOptionsStateRef();

  const tabData = [
    {
      label: "メイン設定",
      content: (
        <>
          <UserTimeOffsetChange />
          <Separator className="bg-foreground/20 my-4" />
          <UserSoundEffectCheckbox />
        </>
      ),
    },
    {
      label: "表示設定",
      content: (
        <>
          <UserNextDisplayRadioButton />
          <Separator className="bg-foreground/20 my-4" />
          <UserLineCompletedRadioButton />
          <Separator className="bg-foreground/20 my-4" />
          <UserWordFontSize />
          {isMdScreen && (
            <>
              <Separator className="bg-foreground/20 my-4" />
              <UserWordScrollChange />
            </>
          )}
        </>
      ),
    },
    { label: "キーボード設定", content: <UserShortcutKeyCheckbox /> },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SettingIcon />
      </PopoverTrigger>
      <PopoverContent
        className={isMdScreen ? "w-lg p-4" : "w-screen p-4"}
        align={isMdScreen ? "end" : "center"}
        side="bottom"
        sideOffset={10}
        alignOffset={isMdScreen ? -100 : 0}
      >
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
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
          className="text-destructive hover:bg-destructive/10 mt-4 ml-auto block"
        >
          設定をリセット
        </Button>
        <ResetSettingModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

const UserLineCompletedRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { line_completed_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.line_completed_display) => {
    setUserTypingOptions({ line_completed_display: value });
  };

  return (
    <LabeledRadioGroup
      label="打ち切り時のワード表示"
      labelClassName="mb-2 block text-lg font-semibold"
      value={line_completed_display}
      onValueChange={changeRadio}
      className="flex flex-row gap-5"
    >
      <LabeledRadioItem value="HIGH_LIGHT" label="ワードハイライト" />
      <LabeledRadioItem value="NEXT_WORD" label="次のワードを表示" />
    </LabeledRadioGroup>
  );
};

const UserNextDisplayRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { next_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.next_display) => {
    setUserTypingOptions({ next_display: value });
  };

  return (
    <LabeledRadioGroup
      value={next_display}
      onValueChange={changeRadio}
      label="次の歌詞表示"
      className="flex flex-row gap-5"
      labelClassName="text-lg font-semibold"
    >
      <LabeledRadioItem value="LYRICS" label="歌詞" />
      <LabeledRadioItem value="WORD" label="ワード" />
    </LabeledRadioGroup>
  );
};

interface ResetSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetSettingModal = ({ isOpen, onClose }: ResetSettingModalProps) => {
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
      <DialogContent id="reset-setting-modal" className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>設定のリセット</DialogTitle>
          <DialogDescription>すべての設定をデフォルトにリセットしますか？この操作は元に戻せません。</DialogDescription>
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

export default SettingPopover;
