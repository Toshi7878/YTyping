import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";

interface SelectFormFieldProps {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  onSubmit: SubmitHandler<FieldValues>;
}

const SelectFormField = ({ label, name, options, onSubmit }: SelectFormFieldProps) => {
  const { register, handleSubmit } = useFormContext();
  const { debounce } = useDebounce(500);

  return (
    <FormControl as="form" gap={3} display="flex" flexDirection="column">
      <FormLabel mb={0} display="flex" alignItems="center" gap={2} htmlFor="custom_user_active_state">
        {label}
      </FormLabel>
      <Select
        width="fit-content"
        size="lg"
        {...register(name, {
          setValueAs: (value: (typeof options)[number]["value"]) => {
            debounce(() => {
              handleSubmit(onSubmit)();
            });

            return value;
          },
        })}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectFormField;
