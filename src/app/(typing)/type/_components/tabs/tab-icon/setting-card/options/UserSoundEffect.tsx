import { usePlayer } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useSoundEffect } from "@/app/(typing)/type/_lib/hooks/playing/soundEffect";
import VolumeRange from "@/components/shared/VolumeRange";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { H5 } from "@/components/ui/typography";

const UserSoundEffectCheckbox = () => {
  const {
    typeSound: type_sound,
    missSound: miss_sound,
    lineClearSound: line_clear_sound,
  } = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();
  const { setUserTypingOptions } = useSetUserTypingOptions();
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
              typeSound: value,
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
              missSound: value,
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
              lineClearSound: value,
            });
            if (value) clearTypeSoundPlay();
          }}
        />
      </div>
    </section>
  );
};

export default UserSoundEffectCheckbox;
