import { Button, ButtonProps } from "@chakra-ui/react";

const EndMainButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button variant="endMain" {...props}>
      {children}
    </Button>
  );
};

export default EndMainButton;
