import EditorLyricsInput from "./child/EditorLyricsInput";
import EditorSelectedLineCountInput from "./child/EditorSelectedLineCount";
import EditorTimeInput from "./child/EditorTimeInput";
import EditorWordInput from "./child/EditorWordInput";

const EditorLineInput = () => {
  return (
    <>
      <div className="flex items-center">
        <EditorTimeInput />
        <EditorLyricsInput />
      </div>
      <div className="flex items-center">
        <EditorSelectedLineCountInput />
        <EditorWordInput />
      </div>
    </>
  );
};

export default EditorLineInput;
