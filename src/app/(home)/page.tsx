import { Box } from "@chakra-ui/react";
import Content from "./Content";
import HomeProvider from "./HomeProvider";

export default function Home() {
  return (
    <HomeProvider>
      <Box
        as="main"
        minH="100vh"
        width={"100%"}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        pt={16}
      >
        <Content />
      </Box>
    </HomeProvider>
  );
}
