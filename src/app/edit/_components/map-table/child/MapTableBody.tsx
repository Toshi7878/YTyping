"use client";
import { useMapState } from "@/app/edit/atoms/mapReducerAtom";
import { useSetCssLength } from "@/app/edit/atoms/stateAtoms";
import { useWindowKeydownEvent } from "@/app/edit/hooks/useKeyDown";
import { LINE_ROW_SWITCH_CLASSNAMES } from "@/app/edit/ts/const/editDefaultValues";
import { MapLineEdit } from "@/types/map";
import { useEffect, useMemo, useState } from "react";
import LineRow from "./child/LineRow";
import LineOptionModal from "./LineOptionModal";

function MapTableBody() {

  const [optionModalIndex, setOptionModalIndex] = useState<number | null>(null);
  const [lineOptions, setLineOptions] = useState<MapLineEdit["options"] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const setCustomStyleLength = useSetCssLength();
  const windowKeydownEvent = useWindowKeydownEvent();
  const map = useMapState();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => windowKeydownEvent(event, optionModalIndex);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionModalIndex]);

  const renderedRows = useMemo(
    () => {
      let customStyleLength = 0;

      const rows = map.map((line, index) => {
        const eternalCSS = line.options?.eternalCSS;
        const changeCSS = line.options?.changeCSS;
        if (eternalCSS) {
          customStyleLength += eternalCSS.length;
        }

        if (changeCSS) {
          customStyleLength += changeCSS.length;
        }

        return (
          <LineRow
            key={index}
            index={index}
            line={line}
            onOpen={() => setIsOpen(true)}
            setLineOptions={setLineOptions}
            setOptionModalIndex={setOptionModalIndex}
          />
        );
      });

      setCustomStyleLength(customStyleLength);

      return rows;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map]
  );

  return (
    <>
      {renderedRows}
      <style>
        {`

      .${LINE_ROW_SWITCH_CLASSNAMES.currentTime} {
        background: hsl(var(--secondary) / 0.25);
      }

        .${LINE_ROW_SWITCH_CLASSNAMES.selected} {
        outline: 1px solid hsl(var(--foreground));
        background: hsl(var(--primary) / 0.9);
      }

      [id*="line_"]:hover:not(.${LINE_ROW_SWITCH_CLASSNAMES.selected}) {
      background: hsl(var(--primary) / 0.31);
      }


      .error-line {
      background: hsl(var(--destructive) / 0.21);
      }
      `}
      </style>

      {isOpen && (
        <LineOptionModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          optionModalIndex={optionModalIndex}
          setOptionModalIndex={setOptionModalIndex}
          lineOptions={lineOptions}
        />
      )}
    </>
  );
}

export default MapTableBody;
