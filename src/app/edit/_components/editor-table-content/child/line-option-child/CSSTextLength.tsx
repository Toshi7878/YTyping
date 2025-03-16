"use client";
import { useCssLengthState } from "@/app/edit/atoms/stateAtoms";
import { MapData } from "@/app/type/ts/type";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";

interface CSSTextLengthProps {
  eternalCSSText: string;
  changeCSSText: string;
  lineOptions: MapData["options"] | null;
}

export default function CSSTextLength({ eternalCSSText, changeCSSText, lineOptions }: CSSTextLengthProps) {
  const theme: ThemeColors = useTheme();

  const customStyleLength = useCssLengthState();

  const loadLineCustomStyleLength =
    Number(lineOptions?.eternalCSS?.length || 0) + Number(lineOptions?.eternalCSS?.length || 0);

  const calcAllCustomStyleLength =
    customStyleLength - loadLineCustomStyleLength + (eternalCSSText.length + changeCSSText.length);
  return (
    <Box
      textAlign="right"
      color={calcAllCustomStyleLength <= 10000 ? theme.colors.text.body : theme.colors.error.light}
    >
      {calcAllCustomStyleLength} / 10000
    </Box>
  );
}
