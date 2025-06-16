import { useSelectIndexState } from "@/app/edit/_lib/atoms/stateAtoms";
import { Input } from "@/components/ui/input/input";

const EditorSelectedLineCountInput = () => {
  const selectedLineCount = useSelectIndexState();
  return (
    <Input placeholder="No." className="bg-muted h-8 w-[90px] opacity-100" disabled value={selectedLineCount ?? ""} />
  );
};

export default EditorSelectedLineCountInput;
