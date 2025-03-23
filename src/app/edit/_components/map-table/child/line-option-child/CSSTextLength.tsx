"use client";
import { useCssLengthState } from "@/app/edit/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { MapLineEdit } from "@/types/map";
import { Box, useTheme } from "@chakra-ui/react";

interface CSSTextLengthProps {
  eternalCSSText: string;
  changeCSSText: string;
  lineOptions: MapLineEdit["options"] | null;
}

export default function CSSTextLength({ eternalCSSText, changeCSSText, lineOptions }: CSSTextLengthProps) {
  const theme: ThemeColors = useTheme();

  const cssLength = useCssLengthState();

  const loadLineCustomStyleLength =
    Number(lineOptions?.eternalCSS?.length || 0) + Number(lineOptions?.changeCSS?.length || 0);

  const calcAllCustomStyleLength =
    cssLength - loadLineCustomStyleLength + (eternalCSSText.length + changeCSSText.length);
  return (
    <Box
      textAlign="right"
      color={calcAllCustomStyleLength <= 10000 ? theme.colors.text.body : theme.colors.error.light}
    >
      {calcAllCustomStyleLength} / 10000
    </Box>
  );
}
