import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { useSoundEffect } from "@/app/(typing)/type/hooks/playing-hooks/soundEffect";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

interface CheckBoxOptionProps {
  label: string;
  name: string;
  defaultChecked: boolean;
}

const CheckBoxOption = ({ label, name, defaultChecked: isChecked = false }: CheckBoxOptionProps) => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { clearTypeSoundPlay, typeSoundPlay, missSoundPlay } = useSoundEffect();
  const userTypingOptions = useUserTypingOptionsState();
  const currentChecked = userTypingOptions[name] ?? isChecked;

  const onChange = (checked: boolean) => {
    setUserTypingOptions({ [name]: checked });

    if (checked) {
      if (name === "type_sound") {
        typeSoundPlay();
      } else if (name === "miss_sound") {
        missSoundPlay();
      } else if (name === "line_clear_sound") {
        clearTypeSoundPlay();
      }
    }
  };

  return (
    <div className="flex items-center space-x-2 px-2">
      <Checkbox
        id={name}
        name={name}
        checked={currentChecked}
        onCheckedChange={onChange}
      />
      <label
        htmlFor={name}
        className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
};

export default CheckBoxOption;
