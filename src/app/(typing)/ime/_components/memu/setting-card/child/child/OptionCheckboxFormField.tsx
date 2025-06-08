import { useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Checkbox } from "@/components/ui/checkbox";
import * as React from "react";

interface CheckBoxOptionProps {
  label: string;
  name: string;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const OptionCheckboxFormField = ({ label, name, defaultChecked, onChange, ...props }: CheckBoxOptionProps) => {
  const userTypingOptions = useUserTypingOptionsState();
  const currentChecked = userTypingOptions[name] ?? defaultChecked;

  const handleCheckedChange = (checked: boolean) => {
    if (onChange) {
      // Chakra UIのonChangeイベントと互換性を保つため、偽のChangeEventを作成
      const fakeEvent = {
        target: {
          checked,
          name,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
  };

  return (
    <div className="flex items-center space-x-3 px-2 py-1">
      <Checkbox id={name} name={name} checked={currentChecked} onCheckedChange={handleCheckedChange} {...props} />
      <label htmlFor={name} className="text-lg leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
    </div>
  );
};

export default OptionCheckboxFormField;
