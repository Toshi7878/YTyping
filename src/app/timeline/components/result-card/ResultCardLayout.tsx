import { Box } from "@chakra-ui/react";
import React from "react";

const ResultCardLayout = ({ children }) => {
  return (
    <Box display="grid" gridTemplateColumns={{ base: "1fr" }} gap={3} mb={3} w="70vw">
      {children}
    </Box>
  );
};

export default ResultCardLayout;
