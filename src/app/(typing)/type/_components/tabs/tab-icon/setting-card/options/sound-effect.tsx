import { usePlayer } from "@/app/(typing)/type/_lib/atoms/read-atoms";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useSoundEffect } from "@/app/(typing)/type/_lib/playing/use-sound-effect";
import { VolumeRange } from "@/components/shared/volume-range";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { H5 } from "@/components/ui/typography";

export const UserSoundEffectCheckbox = () => {
  const { typeSound, missSound, completedTypeSound } = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const { playSoundEffect } = useSoundEffect();

  return (
    <section className="space-y-4">
      <H5>サウンド</H5>
      <VolumeRange player={readPlayer()} />
      <div className="flex flex-row gap-4">
        <LabeledCheckbox
          label="タイプ音"
          defaultChecked={typeSound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              typeSound: value,
            });
            if (value) playSoundEffect("type");
          }}
        />
        <LabeledCheckbox
          label="ミス音"
          defaultChecked={missSound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              missSound: value,
            });
            if (value) playSoundEffect("miss");
          }}
        />
        <LabeledCheckbox
          label="打ち切り音"
          defaultChecked={completedTypeSound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              completedTypeSound: value,
            });
            if (value) playSoundEffect("typeCompleted");
          }}
        />
      </div>
    </section>
  );
};
