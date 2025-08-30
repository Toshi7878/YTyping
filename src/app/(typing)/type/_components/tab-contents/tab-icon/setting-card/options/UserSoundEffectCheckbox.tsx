import { usePlayer } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useSoundEffect } from "@/app/(typing)/type/_lib/hooks/playing-hooks/soundEffect";
import VolumeRange from "@/components/share-components/VolumeRange";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";

const UserSoundEffectCheckbox = () => {
  const { type_sound, miss_sound, line_clear_sound } = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { typeSoundPlay, missSoundPlay, clearTypeSoundPlay } = useSoundEffect();

  return (
    <div className="flex flex-col gap-4">
      <span className="text-lg font-semibold">サウンド</span>
      <VolumeRange player={readPlayer()} />
      <div className="flex flex-row gap-2">
        <LabeledCheckbox
          label="タイプ音"
          name="type_sound"
          defaultChecked={type_sound}
          onCheckedChange={(value) => {
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
          onCheckedChange={(value) => {
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
          onCheckedChange={(value) => {
            setUserTypingOptions({
              line_clear_sound: value,
            });
            if (value) clearTypeSoundPlay();
          }}
        />
      </div>
    </div>
  );
};

export default UserSoundEffectCheckbox;
