import { UploadResult } from "@/types";
import { Box, Flex, useToast } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

export const useSuccessToast = () => {
  const toast = useToast();
  const duration = 5000;
  const position = "bottom-right";
  const isClosable = true;

  return (state: UploadResult) => {
    const isSuccess = state.status === 200 ? true : false;
    const title = state.title;
    const description = state.message ? <small>{state.message}</small> : null;
    // const status = isSuccess ? "success" : "error";

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
          bg={isSuccess ? "green.500" : "red.400"}
          borderRadius="md"
          boxShadow="md"
          display="flex"
          alignItems="center"
        >
          <Box>
            <Flex alignItems="center" fontWeight="bold" fontSize="lg">
              {isSuccess ? <CheckCircleIcon mr={3} /> : <WarningIcon mr={3} />}

              {title}
            </Flex>
            {description ? <Box mt={2}>{description}</Box> : ""}
          </Box>
        </Box>
      ),
    });
  };
};
