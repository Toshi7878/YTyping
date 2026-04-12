"use client";
import { MdRestartAlt } from "react-icons/md";
import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_atoms/hydrate";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter";
import { H4 } from "@/components/ui/typography";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";

export const WindowDisplayField = () => {
  const { windowScaleWidth } = useTypingOptionsState();

  const resetToDefaults = () => {
    setTypingOptions({ windowScaleWidth: DEFAULT_TYPING_OPTIONS.windowScaleWidth });
  };

  return (
    <section className="flex flex-col gap-4">
      <H4>画面幅調整</H4>

      <div className="flex items-center gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ windowScaleWidth: value })}
          step={10}
          min={1100}
          max={1400}
          valueDigits={0}
          value={windowScaleWidth}
          label="画面幅"
          incrementTooltip="画面の幅を広くします。"
          decrementTooltip="画面の幅を狭くします。"
          size="lg"
          unit="px"
        />
        <Button size="sm" variant="outline" onClick={resetToDefaults}>
          <MdRestartAlt className="mr-2" />
          リセット
        </Button>
      </div>
    </section>
  );
};
