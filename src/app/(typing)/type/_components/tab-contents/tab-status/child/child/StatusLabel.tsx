import { Text } from "@chakra-ui/react";

interface StatusLabelProps {
  label: string;
}

const StatusLabel = ({ label }: StatusLabelProps) => {
  return (
    <Text
      as="span"
      className="status-label"
      position="relative"
      right="8px"
      fontSize={{ base: "3.5rem", md: "80%" }}
      letterSpacing={label === "kpm" ? "0.2em" : ""}
      textTransform="capitalize"
    >
      {label}
    </Text>
  );
};

export default StatusLabel;
