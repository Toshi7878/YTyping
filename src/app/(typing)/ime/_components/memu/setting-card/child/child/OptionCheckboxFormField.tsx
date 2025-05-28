import { useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Checkbox, CheckboxProps } from "@chakra-ui/react";

interface CheckBoxOptionProps {
  label: string;
  name: string;
}

const OptionCheckBoxFormField = ({ label, name, ...props }: CheckBoxOptionProps & CheckboxProps) => {
  const userTypingOptions = useUserTypingOptionsState();
  const currentChecked = userTypingOptions[name] ?? props.isChecked;

  return (
    <Checkbox pl={2} pr={2} size="lg" name={name} {...props} isChecked={currentChecked}>
      {label}
    </Checkbox>
  );
};

export default OptionCheckBoxFormField;
