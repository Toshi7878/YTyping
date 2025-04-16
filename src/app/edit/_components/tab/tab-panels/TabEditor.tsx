import { ThemeColors } from "@/types";
import { Card, CardBody, Flex, Stack, useTheme } from "@chakra-ui/react";

import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorInputs";
import ManyPhraseTextarea from "./tab-editor-child/ManyPhraseTextarea";
import AddTimeAdjust from "./tab-settings-shortcutlist-child/settings-child/AddTimeAdjust";

const TabEditor = () => {
  const theme: ThemeColors = useTheme();

  return (
    <Card variant="filled" bg={theme.colors.background.card} boxShadow="lg" color={theme.colors.text.body}>
      <CardBody py={4}>
        <Stack display="flex" flexDirection="column" gap={1}>
          <EditorLineInput />

          <Flex justifyContent="space-between" alignItems="center">
            <EditorButtons />
            <AddTimeAdjust />
          </Flex>
          <ManyPhraseTextarea />
        </Stack>
      </CardBody>
    </Card>
  );
};

export default TabEditor;
