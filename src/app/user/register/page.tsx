import { Box } from "@chakra-ui/react";
import Content from "./Content";

export default async function Home() {
  return (
    <Box
      as="main"
      minH="100vw"
      width={"100vw"}
      display="flex"
      flexDirection="column"
      alignItems="center"
      pt={20}
    >
      <Content />
    </Box>
  );
}
