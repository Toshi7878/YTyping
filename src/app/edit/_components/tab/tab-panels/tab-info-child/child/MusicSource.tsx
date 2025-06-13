import { useMapSourceState, useSetMapSource } from "@/app/edit/atoms/stateAtoms";
import InfoInput from "./child/InfoInput";

interface MusicSourceInputProps {
  isGeminiLoading: boolean;
}

const MusicSourceInput = (props: MusicSourceInputProps) => {
  const setMusicSouce = useSetMapSource();
  const musicSource = useMapSourceState();

  return (
    <div className="flex items-center">
      <InfoInput
        label={"ソース"}
        placeholder="曲が使用されているアニメ・ドラマ・映画タイトルを入力"
        inputState={musicSource}
        setInputState={setMusicSouce}
        isRequired={false}
        isGeminiLoading={props.isGeminiLoading}
      />
    </div>
  );
};

export default MusicSourceInput;
