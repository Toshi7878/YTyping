import { ThemeColors } from "@/types";
import { Card, CardBody, Stack, useTheme } from "@chakra-ui/react";
import EditorSettingModal from "./tab-settings-shortcutlist-child/EditSettings";
import ShortCutKeyList from "./tab-settings-shortcutlist-child/settings-child/ShortCutKeyList";

const TabSettings = () => {
  const theme: ThemeColors = useTheme();

  return (
    <Card bg={theme.colors.background.card}>
      <CardBody>
        <Stack spacing={6}>
          <EditorSettingModal />
          <ShortCutKeyList />
        </Stack>
      </CardBody>
    </Card>
  );
};

export default TabSettings;
