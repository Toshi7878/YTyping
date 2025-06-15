"use client";
import { useCssLengthState } from "@/app/edit/_lib/atoms/stateAtoms";
import { MapLineEdit } from "@/types/map";

interface CSSTextLengthProps {
  eternalCSSText: string;
  changeCSSText: string;
  lineOptions: MapLineEdit["options"] | null;
}

export default function CSSTextLength({ eternalCSSText, changeCSSText, lineOptions }: CSSTextLengthProps) {
  const cssLength = useCssLengthState();

  const loadLineCustomStyleLength =
    Number(lineOptions?.eternalCSS?.length || 0) + Number(lineOptions?.changeCSS?.length || 0);

  const calcAllCustomStyleLength =
    cssLength - loadLineCustomStyleLength + (eternalCSSText.length + changeCSSText.length);
  return (
    <div className={`text-right ${calcAllCustomStyleLength <= 10000 ? "" : "text-destructive"}`}>
      {calcAllCustomStyleLength} / 10000
    </div>
  );
}
