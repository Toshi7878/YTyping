import { useSelectIndexState } from "@/app/edit/atoms/stateAtoms";
import { Input } from "@/components/ui/input/input";

const EditorSelectedLineCountInput = () => {
  const selectedLineCount = useSelectIndexState();
  return (
    <Input
      placeholder="No."
      className="h-8 w-[90px] bg-muted opacity-100"
      disabled
      value={selectedLineCount ?? ""}
    />
  );
};

export default EditorSelectedLineCountInput;
