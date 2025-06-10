import { useIsWordConvertingState, useSetWord, useWordState } from "@/app/edit/atoms/stateAtoms";
import { useWordConvertButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { useTheme } from "@/hooks/use-theme";
import { ThemeColors } from "@/types";
import { Loader2 } from "lucide-react";

interface DirectEditWordInputProps {
  directEditWordInputRef: React.RefObject<HTMLInputElement>;
}

const DirectEditWordInput = (props: DirectEditWordInputProps) => {
  const theme: ThemeColors = useTheme();
  const isLoadWordConvert = useIsWordConvertingState();
  const selectWord = useWordState();

  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const setWord = useSetWord();

  return (
    <div className="flex items-center justify-between gap-1">
      <Button
        disabled={isLoadWordConvert}
        variant="outline"
        size="sm"
        className="h-[35px] w-[8%] min-w-[50px]"
        style={{
          color: theme.colors.text.body,
          borderColor: theme.colors.secondary.main
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${theme.colors.secondary.main}60`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onClick={wordConvertButtonEvent}
      >
        {isLoadWordConvert ? <Loader2 className="h-4 w-4 animate-spin" /> : "変換"}
      </Button>
      <Input
        ref={props.directEditWordInputRef}
        className="h-7 w-[91%] text-sm"
        autoComplete="off"
        value={selectWord}
        onChange={(e) => setWord(e.target.value)}
      />
    </div>
  );
};

export default DirectEditWordInput;
