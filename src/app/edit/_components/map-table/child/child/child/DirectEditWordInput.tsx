import { useIsWordConvertingState, useSetWord, useWordState } from "@/app/edit/atoms/stateAtoms";
import { useWordConvertButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";

interface DirectEditWordInputProps {
  directEditWordInputRef: React.RefObject<HTMLInputElement>;
}

const DirectEditWordInput = (props: DirectEditWordInputProps) => {
  const isLoadWordConvert = useIsWordConvertingState();
  const selectWord = useWordState();

  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const setWord = useSetWord();

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        disabled={isLoadWordConvert}
        variant="outline"
        size="sm"
        className="h-8 w-[8%] hover:bg-secondary/40"
        onClick={wordConvertButtonEvent}
      >
        {isLoadWordConvert ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          "変換"
        )}
      </Button>
      <Input
        ref={props.directEditWordInputRef}
        className="h-8 w-[91%]"
        autoComplete="off"
        value={selectWord}
        onChange={(e) => setWord(e.target.value)}
      />
    </div>
  );
};

export default DirectEditWordInput;
