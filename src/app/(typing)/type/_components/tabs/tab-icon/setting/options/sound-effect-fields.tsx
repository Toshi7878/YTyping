import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { useYTPlayer } from "@/app/(typing)/type/_lib/atoms/youtube-player";
import { playSound } from "@/app/(typing)/type/_lib/playing/sound-effect";
import { VolumeRange } from "@/components/shared/volume-range";
import { CheckboxCardGroup } from "@/components/ui/checkbox/checkbox";
import { H4 } from "@/components/ui/typography";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";

export const SoundEffectFields = () => {
  const { typeSound, missSound, completedTypeSound } = useTypingOptionsState();
  const YTPlayer = useYTPlayer();

  const items = [
    {
      label: "タイプ音",
      defaultChecked: DEFAULT_TYPING_OPTIONS.typeSound,
      checked: typeSound,
      onCheckedChange: (checked: boolean) => {
        setTypingOptions({ typeSound: checked });
        if (checked) playSound("type");
      },
    },
    {
      label: "ミス音",
      defaultChecked: DEFAULT_TYPING_OPTIONS.missSound,
      checked: missSound,
      onCheckedChange: (checked: boolean) => {
        setTypingOptions({ missSound: checked });
        if (checked) playSound("miss");
      },
    },
    {
      label: "打ち切り音",
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
      <H4>サウンド</H4>
      <VolumeRange YTPlayer={YTPlayer} />
      <CheckboxCardGroup items={items} />
    </div>
  );
};
