import { Card, CardContent } from "@/components/ui/card";

import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorInputs";
import ManyPhraseTextarea from "./tab-editor-child/ManyPhraseTextarea";
import AddTimeAdjust from "./tab-settings-shortcutlist-child/settings-child/AddTimeAdjust";

const TabEditor = () => {
  return (
    <Card className="bg-card shadow-lg text-foreground">
      <CardContent className="py-4">
        <div className="flex flex-col gap-1">
          <EditorLineInput />

          <div className="flex justify-between items-center">
            <EditorButtons />
            <AddTimeAdjust />
          </div>
          <ManyPhraseTextarea />
        </div>
      </CardContent>
    </Card>
  );
};

export default TabEditor;
