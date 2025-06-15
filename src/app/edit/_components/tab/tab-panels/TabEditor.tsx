import { CardWithContent } from "@/components/ui/card";

import AddTimeAdjust from "./tab-editor-child/AddTimeAdjust";
import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorInputs";
import ManyPhraseTextarea from "./tab-editor-child/ManyPhraseTextarea";

const TabEditor = () => {
  return (
    <CardWithContent className="py-3">
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
