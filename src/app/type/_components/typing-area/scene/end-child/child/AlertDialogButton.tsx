import { Button } from "@chakra-ui/react";
import React from "react";
import { useFormStatus } from "react-dom";

const AlertDialogButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button colorScheme="red" type="submit" ml={3} isLoading={pending}>
      ランキングに登録
    </Button>
  );
};

export default AlertDialogButton;
