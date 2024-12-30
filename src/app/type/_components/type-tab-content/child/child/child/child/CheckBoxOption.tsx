import { useSoundEffect } from "@/app/type/hooks/playing-hooks/useSoundEffect";
import {
  useSetIsOptionEdited,
  useSetUserOptionsAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { Checkbox } from "@chakra-ui/react";
import React from "react";

interface CheckBoxOptionProps {
  label: string;
  name: string;
  defaultChecked: boolean;
}

const CheckBoxOption = ({
  label,
  name,
  defaultChecked: isChecked = false,
}: CheckBoxOptionProps) => {
  const setUserOptionsAtom = useSetUserOptionsAtom();
  const userOptionsAtom = useUserOptionsAtom();
  const { clearTypeSoundPlay, typeSoundPlay, missSoundPlay } = useSoundEffect();
  const setIsOptionEdited = useSetIsOptionEdited();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    const newUserOptions = {
      ...userOptionsAtom,
      typeSound: name === "typeSound" ? checked : userOptionsAtom.typeSound,
      missSound: name === "missSound" ? checked : userOptionsAtom.missSound,
      lineClearSound: name === "lineClearSound" ? checked : userOptionsAtom.lineClearSound,
    };
    setUserOptionsAtom(newUserOptions);
    if (checked) {
      if (name === "typeSound") {
        typeSoundPlay();
      } else if (name === "missSound") {
        missSoundPlay();
      } else if (name === "lineClearSound") {
        clearTypeSoundPlay();
      }
    }
    setIsOptionEdited(true);
  };
  return (
    <Checkbox ml={2} mr={2} size="lg" name={name} onChange={onChange} defaultChecked={isChecked}>
      {label}
    </Checkbox>
  );
};

export default CheckBoxOption;
