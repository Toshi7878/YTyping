import { CheckboxProps, Flex, FormLabel, Input } from "@chakra-ui/react";

interface CheckBoxOptionProps {
  label: React.ReactNode;
  name: string;
}

const OptionInputFormField = ({ label, name, ...props }: CheckBoxOptionProps & CheckboxProps) => {
  return (
    <Flex flexDirection="column" gap={1}>
      <FormLabel mb={0} htmlFor={name}>
        {label}
      </FormLabel>
      <Input id={name} pl={2} pr={2} size="sm" name={name} {...props} />
    </Flex>
  );
};

export default OptionInputFormField;
