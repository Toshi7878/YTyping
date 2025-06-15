"use client";
import { Textarea } from "@/components/ui/textarea";
import { Dispatch } from "react";

interface CSSInputProps {
  disabled: boolean;
  CSSText: string;
  setCSSText: Dispatch<string>;
  setIsEditedCSS: Dispatch<boolean>;
}

export default function CSSInput(props: CSSInputProps) {
  return (
    <Textarea
      disabled={props.disabled}
      placeholder=""
      className="min-h-[200px] resize-y"
      value={props.CSSText}
      onChange={(e) => {
        props.setCSSText(e.target.value);
        props.setIsEditedCSS(true);
      }}
    />
  );
}
