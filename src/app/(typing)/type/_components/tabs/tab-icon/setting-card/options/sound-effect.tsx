import { readYTPlayer } from "@/app/(typing)/type/_lib/atoms/ref";
import { setUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/state";
import { playSound } from "@/app/(typing)/type/_lib/playing/sound-effect";
import { VolumeRange } from "@/components/shared/volume-range";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { H4 } from "@/components/ui/typography";

export const SoundEffectOptions = () => {
  const { typeSound, missSound, completedTypeSound } = useUserTypingOptionsState();

  return (
    <section className="space-y-4">
      <H4>サウンド</H4>
      <VolumeRange player={readYTPlayer()} />
      <div className="flex flex-row gap-4">
        <LabeledCheckbox
          label="タイプ音"
          defaultChecked={typeSound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({ typeSound: value });
            if (value) playSound("type");
          }}
        />
        <LabeledCheckbox
          label="ミス音"
          defaultChecked={missSound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({ missSound: value });
            if (value) playSound("miss");
          }}
        />
        <LabeledCheckbox
          label="打ち切り音"
          defaultChecked={completedTypeSound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              completedTypeSound: value,
            });
            if (value) playSound("typeCompleted");
          }}
        />
      </div>
    </section>
  );
};
