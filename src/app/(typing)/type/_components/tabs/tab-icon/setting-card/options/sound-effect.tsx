import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { useYTPlayer } from "@/app/(typing)/type/_lib/atoms/yt-player";
import { playSound } from "@/app/(typing)/type/_lib/playing/sound-effect";
import { VolumeRange } from "@/components/shared/volume-range";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { H4 } from "@/components/ui/typography";

export const SoundEffectOptions = () => {
  const { typeSound, missSound, completedTypeSound } = useTypingOptionsState();
  const YTPlayer = useYTPlayer();

  return (
    <section className="space-y-4">
      <H4>サウンド</H4>
      <VolumeRange YTPlayer={YTPlayer} />
      <div className="flex flex-row gap-4">
        <LabeledCheckbox
          label="タイプ音"
          defaultChecked={typeSound}
          onCheckedChange={(checked: boolean) => {
            setTypingOptions({ typeSound: checked });
            if (checked) playSound("type");
          }}
        />
        <LabeledCheckbox
          label="ミス音"
          defaultChecked={missSound}
          onCheckedChange={(checked: boolean) => {
            setTypingOptions({ missSound: checked });
            if (checked) playSound("miss");
          }}
        />
        <LabeledCheckbox
          label="打ち切り音"
          defaultChecked={completedTypeSound}
          onCheckedChange={(checked: boolean) => {
            setTypingOptions({ completedTypeSound: checked });
            if (checked) playSound("typeCompleted");
          }}
        />
      </div>
    </section>
  );
};
