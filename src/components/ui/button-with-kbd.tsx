import type React from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

interface ButtonWithKbdProps {
  buttonLabel: string;
  kbdLabel: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onClickCapture?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
}

export const ButtonWithKbd = (props: ButtonWithKbdProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={props.onClick}
        onClickCapture={props.onClickCapture}
        variant="outline"
        disabled={props.disabled}
        className="rounded-full font-bold text-4xl hover:scale-105 max-sm:p-9 md:text-xl"
      >
        {props.buttonLabel}
      </Button>

      <Kbd
        onClick={props.onClick}
        onClickCapture={props.onClickCapture}
        disabled={props.disabled}
        className="hidden bg-transparent text-xl md:block"
      >
        {props.kbdLabel}
      </Kbd>
    </div>
  );
};

interface ButtonWithDoubleKbdProps {
  prevKbdLabel: string;
  buttonLabel: string;
  nextKbdLabel: string;
  onClick: () => void;
  onClickPrev: () => void;
  onClickNext: () => void;
  className?: string;
  disabled?: boolean;
}

export const ButtonWithDoubleKbd = (props: ButtonWithDoubleKbdProps) => {
  return (
    <div className="flex items-center gap-2">
      <Kbd onClick={props.onClickPrev} disabled={props.disabled} className="bg-transparent text-5xl md:text-xl">
        {props.prevKbdLabel}
      </Kbd>
      <Button
        disabled={props.disabled}
        onClick={props.onClick}
        variant="outline"
        className="rounded-full border font-bold text-4xl hover:scale-105 max-sm:p-9 md:text-xl"
      >
        {props.buttonLabel}
      </Button>
      <Kbd onClick={props.onClickNext} disabled={props.disabled} className="bg-transparent text-5xl md:text-xl">
        {props.nextKbdLabel}
      </Kbd>
    </div>
  );
};
