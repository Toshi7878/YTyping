import { CardWithContent } from "@/components/ui/card";

import AddTimeAdjust from "./tab-editor-child/AddTimeAdjust";
import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorInputs";
import ManyPhraseTextarea from "./tab-editor-child/ManyPhraseTextarea";

const TabEditor = () => {
  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-1" }}>
      <EditorLineInput />

      <div className="flex items-center justify-between">
        <EditorButtons />
        <AddTimeAdjust />
      </div>
      <ManyPhraseTextarea />
    </CardWithContent>
  );
};

export default TabEditor;
