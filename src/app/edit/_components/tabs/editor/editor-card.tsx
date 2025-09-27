import { CardWithContent } from "@/components/ui/card";
import { AddTimeAdjust } from "./add-time-adjust";
import { EditorButtons } from "./editor-buttons";
import { EditorLineInput } from "./editor-input-field";
import { ManyPhraseTextarea } from "./many-phrase-textarea";

export const EditorCard = () => {
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
