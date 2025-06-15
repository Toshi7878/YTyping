import { useSetWord, useWordState } from "@/app/edit/_lib/atoms/stateAtoms";
import { Input } from "@/components/ui/input/input";

const EditorWordInput = () => {
  const word = useWordState();
  const setWord = useSetWord();

  return (
    <Input
      placeholder="ワード"
      className="h-8"
      autoComplete="off"
      value={word}
      onChange={(e) => setWord(e.target.value)}
    />
  );
};

export default EditorWordInput;
