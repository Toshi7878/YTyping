import { useEditLineSelectedCountAtom } from "@/app/edit/edit-atom/editAtom";
import { Input } from "@chakra-ui/react";

const EditorSelectedLineCountInput = () => {
  const selectedLineCount = useEditLineSelectedCountAtom();
  return (
    <Input
      placeholder="No."
      size="sm"
      width="90px"
      disabled
      variant="filled"
      opacity={1}
      _disabled={{ opacity: 1 }}
      value={selectedLineCount ?? ""}
    />
  );
};

export default EditorSelectedLineCountInput;
