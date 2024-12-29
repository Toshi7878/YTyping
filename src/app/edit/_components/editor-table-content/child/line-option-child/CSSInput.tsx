"use client";
import { ThemeColors } from "@/types";
import { Textarea, useTheme } from "@chakra-ui/react";
import { Dispatch } from "react";

interface CSSInputProps {
  disabled: boolean;
  CSSText: string;
  setCSSText: Dispatch<string>;
  setIsEditedCSS: Dispatch<boolean>;
}

export default function CSSInput(props: CSSInputProps) {
  const theme: ThemeColors = useTheme();
  return (
    <Textarea
      bg={theme.colors.background.body}
      disabled={props.disabled}
      placeholder=""
      resize={"vertical"}
      size="md"
      height={"200px"}
      value={props.CSSText}
      onChange={(e) => {
        props.setCSSText(e.target.value);
        props.setIsEditedCSS(true);
      }}
    />
  );
}
