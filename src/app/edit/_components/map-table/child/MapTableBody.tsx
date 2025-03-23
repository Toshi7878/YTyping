"use client";
import { useMapState } from "@/app/edit/atoms/mapReducerAtom";
import { useSetCssLengthState } from "@/app/edit/atoms/stateAtoms";
import { useWindowKeydownEvent } from "@/app/edit/hooks/useKeyDown";
import { LINE_ROW_SWITCH_CLASSNAMES } from "@/app/edit/ts/const/editDefaultValues";
import { ThemeColors } from "@/types";
import { MapLineEdit } from "@/types/map";
import { useDisclosure, useTheme } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import LineRow from "./child/LineRow";
import LineOptionModal from "./LineOptionModal";

function MapTableBody() {
  const theme: ThemeColors = useTheme();

  const [optionModalIndex, setOptionModalIndex] = useState<number | null>(null);
  const [lineOptions, setLineOptions] = useState<MapLineEdit["options"] | null>(null);
  const optionClosure = useDisclosure();

  const setCustomStyleLength = useSetCssLengthState();
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
            onOpen={optionClosure.onOpen}
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
        background: ${theme.colors.secondary.light}40;
      }

        .${LINE_ROW_SWITCH_CLASSNAMES.selected} {
        outline: 1px solid ${theme.colors.text.body};
        background: ${theme.colors.primary.dark};
      }

      [id*="line_"]:hover:not(.${LINE_ROW_SWITCH_CLASSNAMES.selected}) {
      background:${theme.colors.primary.dark}50;
      }


      .error-line {
      background: ${theme.colors.error.light}35;
      }
      `}
      </style>

      {optionClosure.isOpen && (
        <LineOptionModal
          isOpen={optionClosure.isOpen}
          onClose={optionClosure.onClose}
          optionModalIndex={optionModalIndex}
          setOptionModalIndex={setOptionModalIndex}
          lineOptions={lineOptions}
        />
      )}
    </>
  );
}

export default MapTableBody;
