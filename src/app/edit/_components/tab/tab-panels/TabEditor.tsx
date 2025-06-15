import { CardWithContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import AddTimeAdjust from "./tab-editor-child/AddTimeAdjust";
import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorInputs";
import ManyPhraseTextarea from "./tab-editor-child/ManyPhraseTextarea";

const TabEditor = ({ className }: { className: string }) => {
  return (
    <CardWithContent className={cn("py-3", className)}>
      <div className="flex flex-col gap-1">
        <EditorLineInput />

        <div className="flex items-center justify-between">
          <EditorButtons />
          <AddTimeAdjust />
        </div>
        <ManyPhraseTextarea />
      </div>
    </CardWithContent>
  );
};

export default TabEditor;
