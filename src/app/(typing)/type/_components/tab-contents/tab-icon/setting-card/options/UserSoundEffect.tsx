import { usePlayer } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useSoundEffect } from "@/app/(typing)/type/_lib/hooks/playing-hooks/soundEffect";
import VolumeRange from "@/components/share-components/VolumeRange";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { H5 } from "@/components/ui/typography";

const UserSoundEffectCheckbox = () => {
  const { type_sound, miss_sound, line_clear_sound } = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { typeSoundPlay, missSoundPlay, clearTypeSoundPlay } = useSoundEffect();

  return (
    <section className="space-y-4">
      <H5>サウンド</H5>
      <VolumeRange player={readPlayer()} />
      <div className="flex flex-row gap-4">
        <LabeledCheckbox
          label="タイプ音"
          name="type_sound"
          defaultChecked={type_sound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              type_sound: value,
            });
            if (value) typeSoundPlay();
          }}
        />
        <LabeledCheckbox
          label="ミス音"
          name="miss_sound"
          defaultChecked={miss_sound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              miss_sound: value,
            });
            if (value) missSoundPlay();
          }}
        />
        <LabeledCheckbox
          label="打ち切り音"
          name="line_clear_sound"
          defaultChecked={line_clear_sound}
          onCheckedChange={(value: boolean) => {
            setUserTypingOptions({
              line_clear_sound: value,
            });
            if (value) clearTypeSoundPlay();
          }}
        />
      </div>
    </section>
  );
};

export default UserSoundEffectCheckbox;
