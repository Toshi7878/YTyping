import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Box, Flex, useToast } from "@chakra-ui/react";

interface CustomToastProps {
  type: "success" | "error" | "warning";
  title: string;
  message?: string;
}

export const useCustomToast = () => {
  const toast = useToast();
  const duration = 5000;
  const position = "bottom-right";
  const isClosable = true;

  return ({ type, title, message }: CustomToastProps) => {
    const description = message ? <small>{message}</small> : null;
    const bg = type === "success" ? "green.500" : type === "error" ? "red.400" : "yellow.500";
    const icon = type === "success" ? <CheckCircleIcon mr={3} /> : <WarningIcon mr={3} />;

    toast({
      title,
      description,
      duration,
      isClosable,
      position,
      render: () => (
        <Box
          color="white"
          p={5}
          bg={bg}
          borderRadius="md"
          boxShadow="md"
          display="flex"
          alignItems="center"
        >
          <Box>
            <Flex alignItems="center" fontWeight="bold" fontSize="lg">
              {icon}
              {title}
            </Flex>
            {description ? <Box mt={2}>{description}</Box> : ""}
          </Box>
        </Box>
      ),
    });
  };
};
