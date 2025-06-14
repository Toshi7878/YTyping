import { usePlayer } from "@/app/(typing)/type/atoms/refAtoms";
import { useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import VolumeRange from "@/components/share-components/VolumeRange";
import { useUserAgent } from "@/utils/useUserAgent";
import CheckBoxOption from "./child/CheckBoxOption";

const UserSoundEffectCheckbox = () => {
  const { type_sound, miss_sound, line_clear_sound } = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();
  const { isMobile } = useUserAgent();

  return (
    <div className="flex flex-col gap-4">
      <span className="text-lg font-semibold">
        サウンド
      </span>
      {!isMobile && <VolumeRange player={readPlayer()} />}
      <div className="flex flex-row gap-2">
        <CheckBoxOption label={"タイプ音"} name="type_sound" defaultChecked={type_sound} />
        <CheckBoxOption label={"ミス音"} name="miss_sound" defaultChecked={miss_sound} />
        <CheckBoxOption label={"打ち切り音"} name="line_clear_sound" defaultChecked={line_clear_sound} />
      </div>
    </div>
  );
};

export default UserSoundEffectCheckbox;
