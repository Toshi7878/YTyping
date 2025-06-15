"use client";

import {
  useOpenLineOptionDialogIndexState,
  useSetCssLength,
  useSetOpenLineOptionDialogIndex,
} from "@/app/edit/atoms/stateAtoms";
import { LINE_ROW_SWITCH_CLASSNAMES } from "@/app/edit/ts/const";
import { MapLineEdit } from "@/types/map";
import { useState } from "react";

function MapTableBody() {
  const [lineOptions, setLineOptions] = useState<MapLineEdit["options"] | null>(null);
  const openLineOptionDialogIndex = useOpenLineOptionDialogIndexState();
  const setOpenLineOptionDialogIndex = useSetOpenLineOptionDialogIndex();

  const setCustomStyleLength = useSetCssLength();

  const renderedRows = () => {
    let customStyleLength = 0;

    const rows = setCustomStyleLength(customStyleLength);
    return rows;
  };

  return (
    <>
      {renderedRows()}
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
    </>
  );
}

export default MapTableBody;
