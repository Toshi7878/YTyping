import { serverApi } from "@/trpc/server";
import { Box } from "@chakra-ui/react"; // Textを追加
import Content from "./Content";

export default async function Home() {
  const userOptions = await serverApi.userOption.getUserOptions();

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
      <Content userOptions={userOptions} />
    </Box>
  );
}
