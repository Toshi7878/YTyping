import { CardWithContent } from "@/components/ui/card";

import AddTimeAdjust from "./AddTimeAdjust";
import EditorButtons from "./EditorButtons";
import EditorLineInput from "./EditorInputs";
import ManyPhraseTextarea from "./ManyPhraseTextarea";

const TabEditor = () => {
  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-1" }}>
      <EditorLineInput />

      <section className="flex items-center justify-between">
        <EditorButtons />
        <AddTimeAdjust />
      </section>
      <ManyPhraseTextarea />
    </CardWithContent>
  );
};

export default TabEditor;
