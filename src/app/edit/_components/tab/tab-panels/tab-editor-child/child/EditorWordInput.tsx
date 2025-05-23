import { useSetWord, useWordState } from "@/app/edit/atoms/stateAtoms";
import { Input } from "@chakra-ui/react";

const EditorWordInput = () => {
  const word = useWordState();
  const setWord = useSetWord();

  return (
    <Input placeholder="ワード" size="sm" autoComplete="off" value={word} onChange={(e) => setWord(e.target.value)} />
  );
};

export default EditorWordInput;
