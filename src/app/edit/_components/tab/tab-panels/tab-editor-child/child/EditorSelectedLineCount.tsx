import { useSelectedIndexState } from "@/app/edit/atoms/stateAtoms";
import { Input } from "@chakra-ui/react";

const EditorSelectedLineCountInput = () => {
  const selectedLineCount = useSelectedIndexState();
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
