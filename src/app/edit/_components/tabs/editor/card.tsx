import { CardWithContent } from "@/components/ui/card";
import { AddTimeAdjust } from "./add-time-adjust";
import { AddLineButton, DeleteLineButton, UpdateLineButton, WordConvertButton } from "./button";
import { LyricsInput, SelectedLineIndex, TimeInput, WordInput } from "./input";
import { ManyPhraseTextarea } from "./many-phrase-textarea";

export const EditorCard = () => {
  return (
    <CardWithContent className={{ card: "py-3", cardContent: "flex flex-col gap-1" }}>
      <section>
        <div className="flex items-center">
          <TimeInput />
          <LyricsInput />
        </div>
        <div className="flex items-center">
          <SelectedLineIndex />
          <WordInput />
        </div>
      </section>

      <section className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <AddLineButton />
          <UpdateLineButton />
          <WordConvertButton className="w-20 font-bold xl:w-28" label="読み変換" variant="outline-info" />
          <DeleteLineButton />
        </div>
        <AddTimeAdjust />
      </section>
      <ManyPhraseTextarea />
    </CardWithContent>
  );
};
