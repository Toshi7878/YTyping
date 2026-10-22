import { useTranslations } from "next-intl";
import { useYTPlayer } from "@/app/(typing)/type/_feature/atoms/youtube-player";
import { playSound } from "@/app/(typing)/type/_feature/lib/sound-effect";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/schema";
import { VolumeRange } from "@/shared/volume-range";
import { CheckboxCardGroup } from "@/ui/checkbox/checkbox";
import { H4 } from "@/ui/typography";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const SoundEffectFields = () => {
  const t = useTranslations("typing.settings");
  const { typeSound, missSound, completedTypeSound } = useTypingOptionsState();
  const YTPlayer = useYTPlayer();

  const items = [
    {
      label: t("typeSound"),
      defaultChecked: DEFAULT_TYPING_OPTIONS.typeSound,
      checked: typeSound,
      onCheckedChange: (checked: boolean) => {
        setTypingOptions({ typeSound: checked });
        if (checked) playSound("type");
      },
    },
    {
      label: t("missSound"),
      defaultChecked: DEFAULT_TYPING_OPTIONS.missSound,
      checked: missSound,
      onCheckedChange: (checked: boolean) => {
        setTypingOptions({ missSound: checked });
        if (checked) playSound("miss");
      },
    },
    {
      label: t("completedSound"),
      defaultChecked: DEFAULT_TYPING_OPTIONS.completedTypeSound,
      checked: completedTypeSound,
      onCheckedChange: (checked: boolean) => {
        setTypingOptions({ completedTypeSound: checked });
        if (checked) playSound("typeCompleted");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <H4>{t("sound")}</H4>
      <VolumeRange YTPlayer={YTPlayer} />
      <CheckboxCardGroup items={items} />
    </div>
  );
};
