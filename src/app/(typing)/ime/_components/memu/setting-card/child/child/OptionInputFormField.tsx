import { Input } from "@/components/ui/input/input";
import * as React from "react";

interface InputOptionProps {
  label: React.ReactNode;
  name: string;
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
  value?: string;
  isDisabled?: boolean;
}

const OptionInputFormField = ({ label, name, onInput, value, isDisabled, ...props }: InputOptionProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="mb-0 text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <Input
        id={name}
        name={name}
        size="sm"
        onInput={onInput}
        value={value}
        disabled={isDisabled}
        className="px-2"
        {...props}
      />
    </div>
  );
};

export default OptionInputFormField;
