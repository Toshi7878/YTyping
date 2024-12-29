import { WarningIcon } from "@chakra-ui/icons";
import { Box, Flex, useToast } from "@chakra-ui/react";

interface UseWarningToastProps {
  title: string;
  msg: string;
}

export const useWarningToast = () => {
  const toast = useToast();
  const duration = 3000;
  const position = "bottom-right";
  const isClosable = true;

  return ({ title, msg }: UseWarningToastProps) => {
    const description = msg ? <small>{msg}</small> : null;

    toast({
      description,
      duration,
      isClosable,
      position,
      render: () => (
        <Box
          color="white"
          p={5}
          bg="yellow.500"
          borderRadius="md"
          boxShadow="md"
          display="flex"
          alignItems="center"
        >
          <Box>
            <Flex alignItems="center" fontWeight="bold" fontSize="md">
              <WarningIcon mr={3} />
              {title}
            </Flex>
            {description ? <Box mt={2}>{description}</Box> : ""}
          </Box>
        </Box>
      ),
    });
  };
};
