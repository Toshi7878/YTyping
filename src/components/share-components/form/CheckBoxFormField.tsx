import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { Checkbox, FormControl, FormLabel } from "@chakra-ui/react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";

interface CheckBoxFormFieldProps {
  label: string;
  name: string;
  onSubmit: SubmitHandler<FieldValues>;
}

const CheckBoxFormField = ({ label, name, onSubmit }: CheckBoxFormFieldProps) => {
  const { register, handleSubmit } = useFormContext();
  const { debounce } = useDebounce(500);

  return (
    <FormControl as="form" gap={3} display="flex" flexDirection="row" userSelect="none">
      <FormLabel mb={0} display="flex" alignItems="center" gap={2}>
        <Checkbox
          {...register(name, {
            onChange: () => {
              debounce(() => handleSubmit(onSubmit)());
            },
          })}
        />
        {label}
      </FormLabel>
    </FormControl>
  );
};

export default CheckBoxFormField;
