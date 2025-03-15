import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { useSoundEffect } from "@/app/type/hooks/playing-hooks/useSoundEffect";
import { Checkbox } from "@chakra-ui/react";
import React from "react";

interface CheckBoxOptionProps {
  label: string;
  name: string;
  defaultChecked: boolean;
}

const CheckBoxOption = ({ label, name, defaultChecked: isChecked = false }: CheckBoxOptionProps) => {
  const setUserOptionsAtom = useSetUserTypingOptionsState();
  const { clearTypeSoundPlay, typeSoundPlay, missSoundPlay } = useSoundEffect();
  const userTypingOptions = useUserTypingOptionsState();
  const currentChecked = userTypingOptions[name] ?? isChecked;
  const { writeGameUtils } = useGameUtilsRef();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    const newUserOptions = {
      ...userTypingOptions,
      [name]: checked,
    };

    setUserOptionsAtom(newUserOptions);

    if (checked) {
      if (name === "type_sound") {
        typeSoundPlay();
      } else if (name === "miss_sound") {
        missSoundPlay();
      } else if (name === "line_clear_sound") {
        clearTypeSoundPlay();
      }
    }

    writeGameUtils({ isOptionEdited: true });
  };

  return (
    <Checkbox pl={2} pr={2} size="lg" name={name} onChange={onChange} isChecked={currentChecked}>
      {label}
    </Checkbox>
  );
};

export default CheckBoxOption;
