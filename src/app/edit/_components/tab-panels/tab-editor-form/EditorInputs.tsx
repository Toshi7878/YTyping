import { EditorLyricsInput, EditorWordInput } from "./child/EditorLyricsAndWordInput";
import EditorSelectedLineCountInput from "./child/EditorSelectedLineCount";
import EditorTimeInput from "./child/EditorTimeInput";

const EditorLineInput = () => {
  return (
    <section>
      <div className="flex items-center">
        <EditorTimeInput />
        <EditorLyricsInput />
      </div>
      <div className="flex items-center">
        <EditorSelectedLineCountInput />
        <EditorWordInput />
      </div>
    </section>
  );
};

export default EditorLineInput;
