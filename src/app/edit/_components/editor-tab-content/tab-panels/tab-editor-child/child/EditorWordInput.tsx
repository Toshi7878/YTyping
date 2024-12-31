import { useEditLineWordAtom, useSetEditLineWordAtom } from "@/app/edit/edit-atom/editAtom";
import { Input } from "@chakra-ui/react";

const EditorWordInput = () => {
  const word = useEditLineWordAtom();
  const setWord = useSetEditLineWordAtom();

  return (
    <Input
      placeholder="ワード"
      size="sm"
      autoComplete="off"
      value={word}
      onChange={(e) => setWord(e.target.value)}
    />
  );
};

export default EditorWordInput;
