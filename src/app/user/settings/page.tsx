import { Box } from "@chakra-ui/react"; // Textを追加
import Content from "./_components/Content";
import UserSettingsProvider from "./UserSettingsProvider";

export default function Home() {
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
      <UserSettingsProvider>
        <Content />
      </UserSettingsProvider>
    </Box>
  );
}
