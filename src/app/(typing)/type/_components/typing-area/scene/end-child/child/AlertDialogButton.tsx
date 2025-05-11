import { Button, ButtonProps } from "@chakra-ui/react";

const AlertDialogButton = (props: ButtonProps) => {
  return (
    <Button colorScheme="red" type="submit" ml={3} {...props}>
      ランキングに登録
    </Button>
  );
};

export default AlertDialogButton;
